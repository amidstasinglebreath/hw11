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
    let listManagerQuery = ` SELECT CONCAT(m.first_name,' ',m.last_name) AS 'Manager' FROM employee e inner JOIN employee m ON e.manager_id = m.id;`;
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
                    managerUQ(managerList); //two stages? one stage if the array works
                    break;
                case ("Add Employee"):
                    addEmployeeUQ(managerList, roleList); //two stages (if arrays work)
                    break;
                case ("Remove Employee"):
                    removeEmployeeDBQ(); //two stages?
                    break;
                case ("Update Employee Role"):
                    updateRole(); //two stages
                    break;
                    /* //we don't actually need this
                case ("Update Employee Manager"):
                    updateManager(); //two stages
                    break;
                    */
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

//displaying by manager (user query)
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
//
function addEmployeeUQ(namelist, listofRoles) {
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
            choices: listofRoles
        },
        {
            type: "list",
            name: "manager",
            message: "What is the manager of this employee?",
            choices: namelist
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
            addEmployeeUpdate(newEmployee_first_name, newEmployee_last_name, newEmployee_role_id, newEmployee_manager_id);
        });
}

//stage two, updateDB
function addEmployeeUpdate(firstName, lastName, role_id, manager_id){
    let addEmployeeQuery = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)";
    connection.query(addEmployeeQuery, [firstName, lastName, role_id, manager_id], function (err, res) {
        if (err) throw err;
        console.log(firstName + " " + lastName + " was added.");
        //return to main menu
        start();
    });
}

//database access, Should I make this sequential&generic?
function removeEmployeeDBQ() {
    let listNameQuery = "SELECT id, CONCAT(first_name,' ',last_name) AS Name FROM employee;";
    let listName = [];
    connection.query(listNameQuery, function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            listName.push(res[i].id + "." + res[i].Name);
        }
        removeEmployeeUQ(listName);
    });
}

//user query by accessing the above data
function removeEmployeeUQ(nameList){
    inquirer.prompt({
        type: "list",
        name: "remove_employee",
        message: "Which employee do you want to remove?",
        choices: nameList
    })
        .then(function (data) {
            let remove_employee_id = parseInt(data.remove_employee.split(".")[0]);
            //pass response to database call
            removeEmployeeDBD(remove_employee_id);
        });
}

//actually performs the function of deleting an item from the database
function removeEmployeeDBD(target_employee_id){
    let removeQuery = "DELETE FROM employee WHERE  id= ?;";
    connection.query(removeQuery, [remove_employee_id], function (err, res) {
        if (err) throw err;
        console.log(table + " employee was removed!!!");
        updateInfoAfterRemove(target_employee_id);  //update the employee's manager id with this id to null
    })
    //not really sure about this next one, but the argument that we don't want duplicate managers is somewhat persuasive.
}

function updateInfoAfterRemove(remove_employee_id) {
    let updateRemoveQuery = "update employee set manager_id = null WHERE  id = ? ;";
    connection.query(updateRemoveQuery, [remove_employee_id], function (err, res) {
        if (err) throw err;
        console.log("Database was up to date after removing employee!");
        start();
    })
}

//updates the manager of an employee
// not in specifications, do if there's extra time.
/*
function updateManager() {
    // alter from display all, to display name, id, and manager
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

    //inquirer choices for manager

    //update employee set manager id = ${new} where = ${choice} 
}
*/

