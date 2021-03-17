//BUDGET CONTROLLER
var budgetController = (function () {
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round(this.value / totalIncome * 100);
        else
            this.percentage = -1;
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(x => sum += x.value);
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1; //Id 
            } else {
                ID = 0;
            }
            //Create a new item based on inc or exp type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Push to the data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        calculateBudget: function () {

            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //calculate the percentage of the income that we get
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            })
        },

        getPercentage: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage()
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data);
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            })
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        }
    }
})();

//UI CONTROLLER
var UIcontroller = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        budgetIncomeValue: '.budget__income--value',
        budgetExpenseValue: '.budget__expenses--value',
        budgetPercentage: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var nodelistForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, //EITHER inc OR exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addItemList: function (obj, type) {
            var html, newHtml, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div  class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button   class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        //Delete items from the UI
        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        //For clearing the fields after an entry
        clearField: function () {
            var fields, fieldsArray;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach((current, index, array) => {
                current.value = "";
            });

            //changing the cursor to the intital description/FOCUS 
            fieldsArray[0].focus();
        },

        //Display budget infos
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetIncomeValue).textContent = obj.totalInc;
            document.querySelector(DOMstrings.budgetExpenseValue).textContent = obj.totalExp;
            document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage;

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.budgetPercentage).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.budgetPercentage).textContent = '---';
            }
        },

        displayPercentage: function () {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodelistForEach(fields, function (current, index) {
                if (percentages[index] > 0)
                    current.textContent = percentages[index] + '%';
                else
                    current.textContent = '---';
            });
        },

        displayMonth: function(){
            var now, year, months, month;
            
            now = new Date();
            months = ['January','Febuary','March','April','May','June','July','August','September','October','November', 'Decemeber'];
            month = now.getMonth()
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);


            nodelistForEach(fields, function(cur){
                cur.classList.toggle('red-focus')
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        },
    };


})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var setEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.key === 13) {
                // do the thingys
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };

    var calcBudget = function () {
        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget();

        // display the budget
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        //calculate the percentages
        budgetCtrl.calculatePercentages();

        //read percentages from budget controller
        var percentages = budgetCtrl.getPercentage();

        //update the UI with the new percentages
        UICtrl.displayPercentage(percentages);
    }

    var ctrlAddItem = function () {
        var input, newItem;
        //get the input field data
        input = UICtrl.getInput();
        //console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //add the item to the budget controller 
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //add the item to the UI
            UICtrl.addItemList(newItem, input.type)

            //Clearing the fields
            UICtrl.clearField();

            //Calculate function to calc and update 
            calcBudget();

            //calculate and update percentages
            updatePercentages();
        }
    }

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, ID;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemId) {
            //seperating the inc and exp from the parentNode to delete
            splitId = itemId.split('-');
            type = splitId[0];
            ID = parseInt(splitId[1]);

            //delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            //delete the item from the UI
            UICtrl.deleteListItem(itemId);

            //Update and show the budget
            calcBudget();

            //calculate and update percentages
            updatePercentages();
        }
    }
    return {
        init: function () {
            setEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    }

})(budgetController, UIcontroller);

controller.init()