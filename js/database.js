/*
Library for accessing and manipulating the local database
*/

.import QtQuick.LocalStorage 2.0 as Sql

function connect_db(name, version, desc, size){
    return Sql.LocalStorage.openDatabaseSync(name, version, desc, size);
}

function create_tables(){
    var table_defaults = "id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE";
    var tables = [
                "sign_data(" + table_defaults + ", updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL, xml_data TEXT UNIQUE)",
                "contacts(" + table_defaults + ", badge TEXT UNIQUE, first TEXT, last TEXT, email TEXT, title TEXT, company TEXT, phone TEXT, zip TEXT)",
            ];
    var db = connect_db("ScalConf", "1.0", "Scale Conference App", 1000000);
    try{
        db.transaction(function(tx){
            for(var i=0; i<tables.length; i++){
                tx.executeSql("CREATE TABLE IF NOT EXISTS "+tables[i]);
            }
        })
    }catch(err){
        console.log("Error creating table in database: " + err)
    };
}

function add_xml(xml_data){
    var db = connect_db("ScalConf", "1.0", "Scale Conference App", 1000000);
    try{
        db.transaction(function(tx){
            tx.executeSql("INSERT INTO `sign_data`(`xml_data`) VALUES (?)", [xml_data]);
        })
    }catch(err){
        console.log("add_xml() -> " + err);
    };
}

/*
  Add a record to a database table
  @param - table_name - string with table name
  @param - json_data - JSON object formatted with `column_name: data`
*/
function add_record(table_name, json_data){
    var db = connect_db("ScalConf", "1.0", "Scale Conference App", 1000000);
    try{
        db.transaction(function(tx){
            tx.executeSql("INSERT INTO "+ table_name + get_sql(json_data));
        })
    }catch(err){
        console.log("add_record() -> " + err);
    };
}

/*
  Helper function for turning a json object into columns and values syntax.
  JSON should be formated like: column_name: "value"
*/
function get_sql(json_object){
    var cols = "(";
    var vals = "VALUES (";
    for(var x in json_object){
        cols = cols.concat("'", x, "', ");
        vals = vals.concat("'", json_object[x], "', ");
    }

    cols = cols.slice(0, cols.length - 2) + ") ";
    vals = vals.slice(0, vals.length - 2) + ")";
    return cols + vals;
}

function get_xml() {
    var db = connect_db("ScalConf", "1.0", "Scale Conference App", 1000000);
    try{
        var xml;
        db.transaction(function(tx){
            xml = tx.executeSql("SELECT * FROM sign_data ORDER BY id DESC LIMIT 1");
        });
        return xml.rows.item(0).xml_data;
    }catch(err){
        console.log("get_xml() -> " + err);
    };
}

/*
  Adds contact info from the QR scanner to the database
  @param = {array} info - array of strings with info from badge
*/
function add_contact(info) {
    var json_data = {
        badge: info[0],
        first: info[1],
        last: info[2],
        email: info[3],
        title: info[4],
        company: info[5],
        phone: info[6],
        zip: info[7],
    };
    add_record("contacts", json_data);
}







