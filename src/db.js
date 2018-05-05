import { SQLite } from 'expo';
const db = SQLite.openDatabase('db.db');
import moment from 'moment'

export function drop () {
  db.transaction(tx => {
    tx.executeSql('drop table tricks;')
    tx.executeSql('drop table Stances;')
    tx.executeSql('drop table Tags;')
    tx.executeSql('drop table Obstacles;')
  })
}

export function init () {
    db.transaction(tx => {
      // TODO: stance values if don't exist
      //       relationship
      //
      // TODO: rename tricks -> Tricks
      tx.executeSql('create table if not exists tricks (id integer primary key not null, name text, trigger_date DATE, trigger_interval int);');
      tx.executeSql('create table if not exists Stances (id integer primary key not null, name text);')
      tx.executeSql('create table if not exists Tags (id integer primary key not null, name text);')
      tx.executeSql('create table if not exists Obstacles (id integer primary key not null, name text);')
    });
}

// TODO
// return new Promise((resolve, reject) => {
export const Trick = {
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
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM tricks WHERE name=? LIMIT 1', [name], (_, { rows }) => {
        cb(rows)
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