var db = function (obj) {
	var db_name = '';
	if (typeof(obj) == 'string') {
		db_name = obj;
	}
	db_name = db_name || 'db_' + new Date().getTime();

	var obj = obj || {},
		dataBase = openDatabase(
			obj.db_name || db_name,
			obj.db_version || '', //设置为"1.0"偶报错,暂不设置版本号 2014-10-23,18:12:09
			obj.db_descript || 'A db for test',
			obj.table_size || '1048576',
			obj.fun || function () { }
		);


	if (!!dataBase) {

	    console.log("Create a db, success!");

	} else {

	    console.log("Failure to create a db~~");

	}

	/**
	 * help:
	 * create(string tbl_name, array1 col_names, array1 col_types)
	 * 
	 * example:
	 * DB.create('table_test', ['id','name'], ['integer','text'])
	 */
	this.create = function (tbl_name,arr_col,arr_type) {
		dataBase.transaction(
			function (tx) {
				var col_num = arr_col.length,
					i = 0,
					sql = 'create table if not exists '
						+ tbl_name 
						+ '( ';
				//拼接sql
				for (; i < col_num; i++) {
					sql += arr_col[i] + ' ' + arr_type[i] + ',';
				}
				//去掉最后一个逗号
				sql = sql.slice(0,-1) + ')';
				tx.executeSql(
					sql,
					[],
					function (tx,rst) {
						console.log('[Create]Table %s is created!', tbl_name);
					},
					function (tx,err) {
						console.log('[Create_error]%s \n[%s]' ,err.message, sql);
					}
				);
			}
		);
		return {
			///
			/**
			 * help:
			 * insert(array2 col_values)
			 * 
			 * example:
			 * DB.insert([[1,'name']])
			 */
			 //insert操作时，须注意单引号问题，“一换俩”
			 //类似【lnk.insert([[100,"a'b".replace("'","''")]])】
			insert : function (arr_values) {
				dataBase.transaction(
					function (tx) {
						var sql = 'insert into ' + tbl_name + ' select ';
						for (var i = 0,len = arr_values.length; i<len; i++) {

							for (var j = 0,len2 = arr_values[i].length; j<len2; j++) {

								sql += "'" + arr_values[i][j] + "',";
							}

							sql = sql.slice(0,-1) + ' union select ';

						}

						sql = sql.slice(0,-13);
						tx.executeSql(
							sql,
							[],
							function (tx,rst) {
								console.log('[Insert]Data insert OK!\n[%s row(s)..]',rst.rowsAffected);
							},
							function (tx,err) {
								console.log('[Insert_error]%s \n[%s]' ,err.message, sql);
							}
						);
					}
				);
			},
			///
			////
			update : function (obj_update) {
				dataBase.transaction(
					function (tx) {
						var where = obj_update.where || ' 1 = 1 ';
						var sql = 'update ' + tbl_name 
								+ ' set ' + obj_update.set
								+ ' where ' + where;
						tx.executeSql(
							sql,
							[],
							function (tx,rst) {
								console.log('[Update]Data update OK!\n[%s rows..]',rst.rowsAffected);
							},
							function (tx,err) {
								console.log('[Update_error]%s \n[%s]' ,err.message, sql);
							}
						);
					}
				);
			},
			////
			/////
			delete : function (str_where) {
				dataBase.transaction(
					function (tx) {
						var where = str_where || ' 1 = 1',
							sql = 'delete from ' + tbl_name + ' where ' + where;
						tx.executeSql(
							sql,
							[],
							function (tx,rst) {
								console.log('[Delete]Data delete OK!\n[%s rows..]',rst.rowsAffected);
							},
							function (tx,err) {
								console.log('[Delete_error]%s \n[%s]' ,err.message, sql);
							}

						);
					}
				);
			}
			/////
		}
	};

	this.query = function (sql) {
		dataBase.transaction(
			function (tx) {
				tx.executeSql(
					sql,
					[],
					function (tx,rst) {
						console.log('[Query_DIY]OK!\n[%s rows..]',rst.rowsAffected);
						window.query_data = rst;
					},
					function (tx,err) {
						console.log('[Query_DIY_error]%s \n[%s]' ,err.message, sql);
					}

				);
			}
		);
	}



}
