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

