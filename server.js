var inquirer = require("inquirer");
var connection = require("./config/connection.js");
var department = require("./models/department.js");
var employee = require("./models/employee.js");
var role = require("./models/role.js")

var companyData = new Object();
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

//somewhat of a misnomer as they technically just initialize use lists.
var  managerList = [];
function initializeManagers(){
    let listManagerQuery = ` SELECT concat(m.first_name,' ',m.last_name) AS 'Manager' FROM employee e inner JOIN employee m ON e.manager_id = m.id;`;
    connection.query(listManagerQuery, function (err, res) {
        if (err) throw err;
        managerList = [];
        for (var i = 0; i < res.length; i++) {
            managerList.push(res[i].Manager);
        }
    });
}

var roleList = [];
function initializeRoles(){
    let listRoleQuery = "SELECT title FROM role;";
    connection.query(listRoleQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            roleList.push(res[i].title);
        }
    });
}

// main menu function
function start() {
    // console.log(companyData);
    initializeManagers();
    initializeRoles();
    console.log("Main Menu:");
    console.log("\n\n\n");
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
                    viewAll(); // one stage
                    break;
                case ("View all employees by a department"):
                    deptpartmentDBQ(); //two stages
                    break;
                case ("View all employees by a manager"):
                    managerDBQ(); //two stages?
                    break;
                case ("Add Employee"):
                    addEmployee(); //three stages?
                    break;
                case ("Remove Employee"):
                    removeEmployee(); //two stages?
                    break;
                case ("Update Employee Role"):
                    updateRole(); //two stages
                    break;
                case ("Update Employee Manager"):
                    updateManager(); //two stages
                    break;
            }
        });
}

function viewAll() {
    console.log("\n\n\n");
    let query = ` SELECT e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
    'null') AS 'Manager' FROM employee e
LEFT JOIN role ON e.role_id = role.id
LEFT JOIN employee m ON e.manager_id = m.id
LEFT JOIN department ON department_id = department.id;`;
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.table(res);
        start();
    });
}

//stage one of displaying by department (database query)
function deptpartmentDBQ() {
    let deptListQuery = `SELECT name FROM department;`;
    connection.query(deptListQuery, function (err, res) {
        if (err) throw err;
        let deptList = [];
        for (var i = 0; i < res.length; i++) {
            deptList.push(res[i].name);
        }
        // move to stage 2
        departmentUQ(listDept);
    });
}

//stage two of displaying by department (user query)
function departmentUQ(list) {
    inquirer.prompt({
        type: "list",
        name: "department",
        message: "Employees from Which department?",
        choices: list
    })
        .then(function (dept) {
            console.log("\n\n");
            let query = ` SELECT e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
'null') AS 'Manager' FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN department ON department_id = department.id WHERE department.name = ?;`;
            connection.query(query, [dept.department], function (err, res) {
                if (err) throw err;
                console.table(res);
                //return to main menu
                start();
            });
        });
}

//stage one of displaying by manager (database query) 
function managerDBQ() {
    let listManagerQuery = ` SELECT concat(m.first_name,' ',m.last_name) AS 'Manager' FROM employee e inner JOIN employee m ON e.manager_id = m.id;`;
    connection.query(listManagerQuery, function (err, res) {
        if (err) throw err;
        let managerList = [];
        for (var i = 0; i < res.length; i++) {
            managerList.push(res[i].Manager);
        }
        //pass to stage 2
        managerUQ(managerList);
    });
}

//stage two of displaying by manager (user query)
function managerUQ(list) {
    inquirer.prompt({
        type: "list",
        name: "manager",
        message: "Which manager do you want to choose?",
        choices: list
    })
        .then(function (listChoice) {
            let fullName = listChoice.manager;
            let firstName = fullName.split(" ")[0];
            let lastName = fullName.split(" ")[1];
            console.log("\n\n");
            let query = ` SELECT e.id,e.first_name, e.last_name, title, name 'department',salary, IFNULL(CONCAT(m.first_name, ' ' , m.last_name),
            'null') AS 'Manager' FROM employee e LEFT JOIN role ON e.role_id = role.id LEFT JOIN employee m ON e.manager_id = m.id LEFT JOIN department ON department_id = department.id where CONCAT(m.first_name, ' ' , m.last_name) = ? or (e.first_name = ? and e.last_name = ?) ORDER BY 'Manager' desc;`;
            connection.query(query, [fullName, firstName, lastName], function (err, res) {
                if (err) throw err;
                console.table(res);
                //return to main menu
                start();
            });
        });
}

//stage one of adding an employee
//properly connected models would be useful here