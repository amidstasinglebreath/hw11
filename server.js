var inquirer = require("inquirer");
var connection = require("./config/connection.js")


connection.connect(function (err) {
    if (err) throw err;
    let companyStructQuery = "SELECT role.id, title, salary,department_id, name AS department FROM role JOIN department ON role.department_id = department.id;";
    connection.query(companyStructQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            companyData[res[i].title] = res[i];
        }
        start();
    });
});


function start() {
    // console.log(companyData);
    inquirer.prompt({
        type: "list",
        message: "What do you want to do?",
        name: "action",
        choices: [
            "View all the employees",
            "View all the employees by department",
            "View all the employees by manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Department"
        ]
    })
        .then(function (userAns) {
            let userAction = userAns.action;
            switch (userAction) {
                case ("View all the employees"):
                    viewEmployee();
                    break;
                case ("View all the employees by department"):
                    viewEmployeeByDept();
                    break;
                case ("View all the employees by manager"):
                    viewEmployeeByManager();
                    break;
                case ("Add Employee"):
                    addEmployee();
                    break;
                case ("Remove Employee"):
                    removeEmployee();
                    break;
                case ("Update Employee Role"):
                    updateRole();
                    break;
                case ("Update Employee Manager"):
                    updateManager();
                    break;
            }
        });
}

function viewEmployee() {
    console.log("\n\n");
    let query = `Select e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
    'null') AS 'Manager' from employee e
left join role on e.role_id = role.id
left join employee m on e.manager_id = m.id
left join department on department_id = department.id;`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}


function viewEmployeeByDept() {
    let listDeptQuery = `Select name from department;`;
    connection.query(listDeptQuery, function (err, res) {
        if (err) throw err;
        let listDept = [];
        for (var i = 0; i < res.length; i++) {
            listDept.push(res[i].name);
        }
        viewEmployeeByDeptNext(listDept);
    });
}

function viewEmployeeByDeptNext(listDept) {
    inquirer.prompt({
        type: "list",
        name: "department",
        message: "Which department do you want to choose?",
        choices: listDept
    })
        .then(function (userPick) {
            console.log("\n\n");
            let query = `Select e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
    'null') AS 'Manager' from employee e
left join role on e.role_id = role.id
left join employee m on e.manager_id = m.id
left join department on department_id = department.id
Where department.name = ?;`;
            connection.query(query, [userPick.department], function (err, res) {
                if (err) throw err;
                console.table(res);
                start();
            });
        });
}

function viewEmployeeByManager() {
    let listManagerQuery = `Select concat(m.first_name,' ',m.last_name) AS 'Manager' from employee e
    inner join employee m on e.manager_id = m.id;`;
    connection.query(listManagerQuery, function (err, res) {
        if (err) throw err;
        let listManager = [];
        for (var i = 0; i < res.length; i++) {
            listManager.push(res[i].Manager);
        }
        viewEmployeeByManagerNext(listManager);
    });
}


function viewEmployeeByManagerNext(listManager) {
    inquirer.prompt({
        type: "list",
        name: "manager",
        message: "Which manager do you want to choose?",
        choices: listManager
    })
        .then(function (userPick) {
            let fullNmae = userPick.manager;
            let firstName = fullNmae.split(" ")[0];
            let lastName = fullNmae.split(" ")[1];
            console.log("\n\n");
            let query = `Select e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
            'null') AS 'Manager' from employee e
left join role on e.role_id = role.id
left join employee m on e.manager_id = m.id
left join department on department_id = department.id
where CONCAT(m.first_name, ' ' , m.last_name) = ? or (e.first_name = ? and e.last_name = ?)
order by 'Manager' desc;`;
            connection.query(query, [fullNmae, firstName, lastName], function (err, res) {
                if (err) throw err;
                console.table(res);
                start();
            });
        });
}


function addEmployee() {
    let listRoleQuery = "select title from role;";
    let listNameQuery = "select id, concat(first_name,' ',last_name) as Name from employee;";
    let listRole = [];
    let listName = ["None"];
    connection.query(listRoleQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listRole.push(res[i].title);
        }
    });
    connection.query(listNameQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listName.push(res[i].id + "." + res[i].Name);
        }
    });
    setTimeout(function () { addEmployeeNext(listRole, listName) }, 2000); //avoid the sychronuous 
}

function addEmployeeNext(listRole, listName) {
    inquirer.prompt([
        {
            type: "input",
            name: "firstName",
            message: "What is the first name of this employee?",
            validate: async (input) => {
                if (/^[a-zA-Z]+$/.test(input)) {
                    return true;
                }
                console.log("\nPlease enter a valid name");
                return false;
            }
        },
        {
            type: "input",
            name: "lastName",
            message: "What is the last name of this employee?",
            validate: async (input) => {
                if (/^[a-zA-Z]+$/.test(input)) {
                    return true;
                }
                console.log("\nPlease enter a valid name");
                return false;
            }
        },
        {
            type: "list",
            name: "role",
            message: "What is the role of this employee?",
            choices: listRole
        },
        {
            type: "list",
            name: "manager",
            message: "What is the manager of this employee?",
            choices: listName
        }
    ])
        .then(function (data) {
            console.log(data);
            let newEmployee_first_name = data.firstName;
            let newEmployee_last_name = data.lastName;
            let newEmployee_role_id = companyData[data.role].id;
            let newEmployee_manager_id;
            if (data.manager === "None") newEmployee_manager_id = null;
            else {
                newEmployee_manager_id = parseInt(data.manager.split(".")[0]);
            }
            addEmployeeNextNext(newEmployee_first_name, newEmployee_last_name, newEmployee_role_id, newEmployee_manager_id);
        });
}

function addEmployeeNextNext(firstName, lastName, role_id, manager_id) {
    let addEmployeeQuery = "insert into employee (first_name, last_name, role_id, manager_id) values (?,?,?,?)";
    connection.query(addEmployeeQuery, [firstName, lastName, role_id, manager_id], function (err, res) {
        if (err) throw err;
        console.log(firstName + " " + lastName + " was added!!!");
        start();
    });
}

function removeEmployee() {
    let listNameQuery = "select id, concat(first_name,' ',last_name) as Name from employee;";
    let listName = [];
    connection.query(listNameQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listName.push(res[i].id + "." + res[i].Name);
        }
        removeEmployeeNext(listName);
    });
}

function removeEmployeeNext(listName) {
    inquirer.prompt({
        type: "list",
        name: "remove_employee",
        message: "Which employee do you want to remove?",
        choices: listName
    })
        .then(function (data) {
            let remove_employee_id = parseInt(data.remove_employee.split(".")[0]);
            removeEmployeeNextNext(remove_employee_id);
        });
}

function removeEmployeeNextNext(remove_employee_id) {
    let removeQuery = "delete from employee where id= ?;";
    connection.query(removeQuery, [remove_employee_id], function (err, res) {
        if (err) throw err;
        console.log(remove_employee_id + " employee was removed!!!");
        updateInfoAfterRemove(remove_employee_id);  //update the employ's manager id with this id to null
    })
}

function updateInfoAfterRemove(remove_employee_id) {
    let updateRemoveQuery = "update employee set manager_id = null where id = ? ;";
    connection.query(updateRemoveQuery, [remove_employee_id], function (err, res) {
        if (err) throw err;
        console.log("Database was up to date after removing employee!");
        start();
    })
}

function updateRole() {
    let listRoleQuery = "select title from role;";
    let listNameQuery = "select id, concat(first_name,' ',last_name) as Name from employee;";
    let listRole = [];
    let listName = [];
    connection.query(listRoleQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listRole.push(res[i].title);
        }
    });
    connection.query(listNameQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listName.push(res[i].id + "." + res[i].Name);
        }
    });
    setTimeout(function () { updateRoleNext(listRole, listName) }, 2000); //avoid the sychronuous 
}

function updateRoleNext(listRole, listName) {
    let updateName;
    let updateRole;
    inquirer.prompt([
        {
            type: "list",
            name: "employee",
            message: "which employee do you want to update?",
            choices: listName
        },
        {
            type: "list",
            name: "role",
            message: "which role do you want to update to?",
            choices: listRole
        }
    ])
        .then(function (data) {
            updateName = data.employee;
            updateRole = companyData[data.role].id;
            let pickNameRoleIdQuery = "select role_id from employee where concat(first_name,' ',last_name ) = ?;";
            connection.query(pickNameRoleIdQuery,[data.employee], function (err, res) {
                if (err) throw err;
                if (res.role_id === companyData[data.role].id) {
                    console.log("It seems like you update to the same role as before.");
                    inquirer.prompt({
                        type: "confirm",
                        name: "update",
                        message: "Do you want to do the update again?"
                    })
                    .then (function(data){
                        if (data.update) updateRoleNext(listRole,listName);
                        else updateRoleNextNext(updateName, updateRole);
                    });
                }else updateRoleNextNext(updateName, updateRole);
            });
        })
}

function updateRoleNextNext (updateName, updateRole) {
    let updateRoleQuery = "update employee set role_id = ? where concat(first_name,' ',last_name)=?;";
    connection.query(updateRoleQuery,[updateRole,updateName],function (err, res){
        if (err) throw err;
        console.log(updateName +"'s role was updated to "+updateRole);
        start();
    })
}