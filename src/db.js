import { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import moment from 'moment'
import { plural, singular } from 'pluralize';
import _ from 'lodash'
// TODO
// return new Promise((resolve, reject) => {
export const Trick = {
  init(tx) {
      tx.executeSql('create table if not exists tricks (id integer primary key not null, name text, trigger_date DATE, trigger_interval int, stance_id int, prefix_tag_id int, postfix_tag int, obstacle_id int);');
  },

  create(data, cb) {
    const tricks = this.generateTricksDBValues(data)
    const trigger_date     = moment().format("YYYY-MM-DD")
    const trigger_interval = 1
    const values           = tricks.map(t => t.push(trigger_date).push(trigger_interval))
    const inserts          = tricks.map(_ => '(?,?,?,?,?,?,?)').join(',')
    db.transaction(
      tx => {
        tx.executeSql(`insert into tricks (stance_id, prefix_tag_id, name, postfix_tag_id, obstacle_id, trigger_date, trigger_interval) values ${inserts}`, values);
      },
      console.log,
      cb,
    );
  },

  update(name, data, cb) {
    db.transaction(
      tx => {
        tx.executeSql('UPDATE tricks SET name = ? WHERE name = ?' [data.name, name])
        tx.executeSql('select name, stances, prefix_tags, postfix_tags, obstacles from tricks where name=?', [name], (_, { rows }) => {
          let newer = this.generateTricksDBValues(this.state)
          let {deleted, created} = this.diffTrick(earlier, newer)
          this.createFn(created, () => {
            deleted
          })
        });
      },
      console.log,
      cb,
    );
  },

  trigger(obj) {
    return new Promise((resolve, reject) => {
      db.transaction(
        tx => {
          tx.executeSql('UPDATE tricks SET trigger_date=?, trigger_interval=? WHERE id=?', [obj.trigger_date, obj.trigger_interval, obj.id])
        },
        reject,
        resolve,
      );
    })
  },

  delete(name, cb) {
    db.transaction(tx => {
        tx.executeSql('DELETE FROM tricks WHERE name=?', [name])
      }, console.log, cb);
  },

  findByName(name, cb) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM tricks WHERE name=?', [name], (_, { rows }) => {
          resolve(rows)
        })
      }, reject)
    })
  },

  allFuture() {
    return new Promise((resolve, reject) => {  
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM tricks WHERE trigger_date > ?;`, [moment().format("YYYY-MM-DD")],
          (_, { rows: { _array } }) => {
            resolve(_array)
          })
      })
    })
  },

  allByName() {
    return new Promise((resolve, reject) => {  
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM tricks GROUP BY name;`, [],
          (_, { rows: { _array } }) => {
            resolve(_array)
          })
      })
    })
  },

  allTriggered() {
    return new Promise((resolve, reject) => {  
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM tricks WHERE trigger_date <= ?;`, [moment().format("YYYY-MM-DD")],
          (_, { rows: { _array } }) => {
            resolve(_array)
          });
      });
    })
  },

  diffTrick(earlier, newer) {
    const deleted = earlier.filter(e => {
      return !newer.find(n => _.isEquals(e, n))
    })
    const created = newer.filter(n => {
      return !earlier.find(e => _.isEquals(e, n))
    })
    return {deleted, created}
  },

  generateTricksName({ name, stances, prefix_tags, postfix_tags, obstacles }) {
    let arr = []
    getName = obj => obj.name == '_' ? '' : obj.name
    stances.forEach(stance => {
      prefix_tags.forEach(prefix_tag => {
        postfix_tags.forEach(postfix_tag => {
          obstacles.forEach(obstacle => {
            arr.push([ getName(stance), getName(prefix_tag), name, getName(postfix_tag), getName(obstacle)])
          })
        })
      })
    })
    return arr
  },

  generateTricksDBValues({ name, stances, prefix_tags, postfix_tags, obstacles }) {
    let arr = []
    stances.forEach(stance => {
      prefix_tags.forEach(prefix_tag => {
        postfix_tags.forEach(postfix_tag => {
          obstacles.forEach(obstacle => {
            arr.push([stance.id, prefix_tag.id, name, postfix_tag.id, obstacle.id])
          })
        })
      })
    })
    return arr
  }
}

export const Tag = nameBasedTable('tags') 
export const Obstacle = nameBasedTable('obstacles') 

// TODO refactor to use pname and name internally
function nameBasedTable(tableName) {
  const singularName = singular(_.capitalize(tableName))
  const singularLowerName = singular(_.lowerCase(tableName))
  const pluralName   = plural(_.capitalize(tableName))

  return {
    init(tx) {
      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY NOT NULL, name TEXT UNIQUE);`)
      tx.executeSql(`INSERT OR IGNORE INTO ${tableName} (name) VALUES (?)`, ['<empty>']);
    },

    name: singularName,
    pname: pluralName,

    create(name) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(`insert into ${tableName} (name) values (?)`, [name]);
        }, reject, resolve,);
      })
    },

    update(name, newName) {
      return this.findByName(name)
        .then(data => data._array[0].id)
        .then(id => {
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            // TODO verify that this works
            // TODO verify that it works with where name instead of id
            tx.executeSql(`UPDATE ${tableName} SET name = ? WHERE id = ?;`, [newName, id])
          }, reject, resolve,)
        })
      })
    },

    delete(name) {
      return this.findByName(name)
        .then(data => data._array[0].id)
        .then(id => {
          return new Promise((resolve, reject) => {
            db.transaction(tx => {
              tx.executeSql(`DELETE FROM ${tableName} WHERE name=?`, [name])
              tx.executeSql(`DELETE FROM tricks WHERE ${singularLowerName}_id=?`, [id])
            }, reject, resolve,)
          })
        })
    },

    findByName(name) {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql(`SELECT * FROM ${tableName} WHERE name=? LIMIT 1`, [name], (_, { rows }) => {
            resolve(rows)
          })
        })
      })
    },

    all() {
      return new Promise((resolve, reject) => {  
        db.transaction(tx => {
          tx.executeSql(`SELECT * FROM ${tableName};`, [], (_, { rows: { _array } }) => resolve(_array))
        })
      })
    },
  }
}

export const Stance = {
  init(tx) {
      tx.executeSql('create table if not exists stances (id integer primary key not null, name text UNIQUE);')
      tx.executeSql(`INSERT OR IGNORE INTO stances (name) values (?), (?), (?), (?)`, ['Normal', 'Nolli', 'Switch', 'Fakie']);
  },

  all() {
    return new Promise((resolve, reject) => {  
      db.transaction(tx => {
        tx.executeSql(`SELECT * FROM stances;`, [], (_, { rows: { _array } }) => resolve(_array))
      })
    })
  },
}

export function drop () {
  db.transaction(tx => {
    tx.executeSql('drop table tricks;')
    tx.executeSql('drop table stances;')
    tx.executeSql('drop table tags;')
    tx.executeSql('drop table obstacles;')
  })
}

export function init () {
  db.transaction(tx => {
    Trick.init(tx)
    Tag.init(tx)
    Stance.init(tx)
    Obstacle.init(tx)
  })
}
