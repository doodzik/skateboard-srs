import { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import moment from 'moment'
import { plural, singular } from 'pluralize';
import _ from 'lodash'
// TODO
// return new Promise((resolve, reject) => {
export const Trick = {
  init(tx) {
      tx.executeSql('create table if not exists tricks (id integer primary key not null, name text, trigger_date DATE, trigger_interval int, stance_id int, pretag_id int, posttag_id int, obstacle_id int);');
  },

  create(data) {
    const tricks = this.generateTricksDBValues(data)
    const trigger_date     = moment().format("YYYY-MM-DD")
    const trigger_interval = 1
    const values           = tricks.map(t => t.concat(trigger_date).concat(trigger_interval))
    const inserts          = tricks.map(_ => '(?,?,?,?,?,?,?)').join(',')

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(`insert into tricks (stance_id, pretag_id, name, posttag_id, obstacle_id, trigger_date, trigger_interval) values ${inserts}`, _.flatten(values));
      }, reject, resolve,);
    })
  },

  update(name, data) {
    return new Promise((resolve, reject) => {
      if (data.name !== name) {
        db.transaction(tx => {
          tx.executeSql('UPDATE tricks SET name = ? WHERE name = ?', [data.name, name])
        }, reject, resolve)
      } else {
        resolve()
      }
    }).then(() => {
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          tx.executeSql('select name, stance_id, pretag_id, posttag_id, obstacle_id from tricks where name=?', [data.name], (_, { rows: { _array } }) => {
            let newer = this.generateTricksDBValues(data)
            let earlier = this.generateTricksDBValuesFromSelect(_array)
            resolve(this.diffTrick(earlier, newer))
          })
        }, reject, resolve,)
      })
    }).then(({created, deleted}) => {
      if(deleted.length === 0) {
        return created
      }
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          deleted.forEach(trick => {
            tx.executeSql('DELETE FROM tricks WHERE stance_id=? AND pretag_id=? AND name=? AND posttag_id=? AND obstacle_id=?;', trick)
          })
        }, reject, () => resolve(created))
      })
    }).then(created => {
      if(created.length === 0) {
        return
      }
      return new Promise((resolve, reject) => {
        db.transaction(tx => {
          const trigger_date     = moment().format("YYYY-MM-DD")
          const trigger_interval = 1
          const values           = created.map(t => t.concat(trigger_date).concat(trigger_interval))
          const inserts          = created.map(_ => '(?,?,?,?,?,?,?)').join(',')

          tx.executeSql(`insert into tricks (stance_id, pretag_id, name, posttag_id, obstacle_id, trigger_date, trigger_interval) values ${inserts}`, _.flatten(values));
        }, reject, resolve)
      })
    })
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

  delete(name) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
          tx.executeSql('DELETE FROM tricks WHERE name=?', [name])
      }, reject, resolve);
    })
  },

  findByName(name) {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql('SELECT * FROM tricks WHERE name=?', [name], (_, { rows: { _array } }) => {
          resolve(_array)
        })
      }, reject)
    })
  },

  allFuture() {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT t.id as id, t.trigger_date as trigger_date, t.trigger_interval as trigger_interval,
              t.name as name, s.name as stance, preTags.name as prefix_tag, postTags.name as postfix_tag, o.name as obstacle
            FROM tricks AS t
            LEFT JOIN stances as s ON s.id=t.stance_id
            LEFT JOIN posttags as postTags ON postTags.id=t.posttag_id
            LEFT JOIN pretags as preTags ON preTags.id=t.pretag_id
            LEFT JOIN obstacles as o ON o.id=t.obstacle_id
            WHERE t.trigger_date > ?
            ORDER BY date(t.trigger_date) ASC;`
          , [moment().format("YYYY-MM-DD")],
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
          `SELECT t.id as id, t.trigger_date as trigger_date, t.trigger_interval as trigger_interval,
              t.name as name, s.name as stance, preTags.name as prefix_tag, postTags.name as postfix_tag, o.name as obstacle
            FROM tricks AS t
            LEFT JOIN stances as s ON s.id=t.stance_id
            LEFT JOIN posttags as postTags ON postTags.id=t.posttag_id
            LEFT JOIN pretags as preTags ON preTags.id=t.pretag_id
            LEFT JOIN obstacles as o ON o.id=t.obstacle_id
            WHERE t.trigger_date <= ?;`
          , [moment().format("YYYY-MM-DD")],
          (_, { rows: { _array } }) => {
            resolve(_array)
          });
      }, reject);
    })
  },

  diffTrick(earlier, newer) {
    const deleted = earlier.filter(e => {
      return !newer.find(n => _.isEqual(e, n))
    })
    const created = newer.filter(n => {
      return !earlier.find(e => _.isEqual(e, n))
    })
    return {deleted, created}
  },

  generateTrickName({ name, stance, prefix_tag, postfix_tag, obstacle }) {
    getName = n => n == '<empty>' ? '' : n
    return [ getName(stance), getName(prefix_tag), name, getName(postfix_tag), getName(obstacle)].join(' ').trim().replace(/\s{2,}/g, ' ')
  },

  generateTricksName({ name, stances, prefix_tags, postfix_tags, obstacles }) {
    let arr = []
    getName = obj => obj.name == '<empty>' ? '' : obj.name
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
  },

  generateTricksDBValuesFromSelect(rows) {
    const stances = rows.reduce((set, value) => { return set.add(value.stance_id) }, new Set())
    const prefix_tags = rows.reduce((set, value) => { return set.add(value.pretag_id) }, new Set())
    const postfix_tags = rows.reduce((set, value) => { return set.add(value.posttag_id) }, new Set())
    const obstacles = rows.reduce((set, value) => { return set.add(value.obstacle_id) }, new Set())

    let arr = []
    stances.forEach(stance => {
      prefix_tags.forEach(prefix_tag => {
        postfix_tags.forEach(postfix_tag => {
          obstacles.forEach(obstacle => {
            arr.push([stance, prefix_tag, rows[0].name, postfix_tag, obstacle])
          })
        })
      })
    })
    return arr
  },
}

export const PreTag = nameBasedTable('pretags', ['<empty>', 'fs', 'bs', 'fs 180', 'bs 180'])
export const PostTag = nameBasedTable('posttags', ['<empty>', 'fs 180', 'bs 180', 'popout', 'popover'])
export const Obstacle = nameBasedTable('obstacles', ['<empty>', 'ledge', 'hip', 'rail'])

// TODO refactor to use pname and name internally
function nameBasedTable(tableName, defaultValues) {
  const singularName = singular(_.capitalize(tableName))
  const singularLowerName = singular(_.lowerCase(tableName))
  const pluralName = plural(_.capitalize(tableName))

  return {
    init(tx) {
      const inserts = defaultValues.map(_ => '(?)').join(',')

      tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY NOT NULL, name TEXT UNIQUE);`)
      tx.executeSql(`INSERT OR IGNORE INTO ${tableName} (name) VALUES ${inserts}`, defaultValues);
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
        return new Promise((resolve, reject) => {
          db.transaction(tx => {
            tx.executeSql(`UPDATE ${tableName} SET name = ? WHERE name = ?;`, [newName, name])
          }, reject, resolve,)
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
          tx.executeSql(`SELECT * FROM ${tableName} ORDER BY name;`, [], (_, { rows: { _array } }) => resolve(_array))
        })
      })
    },
  }
}

export const Stance = {
  init(tx) {
    tx.executeSql('create table if not exists stances (id integer primary key not null, name text UNIQUE);')
    tx.executeSql(`INSERT OR IGNORE INTO stances (name) values (?), (?), (?), (?)`, ['<empty>', 'Nolli', 'Switch', 'Fakie']);
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
    tx.executeSql('drop table posttags;')
    tx.executeSql('drop table pretags;')
    tx.executeSql('drop table obstacles;')
    // tx.executeSql('DROP DATABASE db;')
  })
}

export function init () {
  db.transaction(tx => {
    Trick.init(tx)
    PreTag.init(tx)
    PostTag.init(tx)
    Stance.init(tx)
    Obstacle.init(tx)
  })
}
