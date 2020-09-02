//BUDGET CONTROLLER STARTS
var budgetController = (function(){
    
    //Function constructor for expenses
    var Expense = function(id,description,value){
      this.id = id;
      this.description = description;
      this.value = value;
      this.percentage = -1;
    };
    
    //Function constructor for income
    var Income = function(id,description,value){
      this.id = id;
      this.description = description;
      this.value = value;
    };
    
    //Methord to calculate the percentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
        this.percentage = Math.round((this.value/totalIncome) * 100);
            } else {
                this.percentage = -1;
            }
     };
    
    
    //Methord to return percentage that we calculated
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    
    
    //function to calculate the sum of values
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    }
    
    //Global Data structure to store the values
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
        //set to -1 because -1 is usually to say it does not exit
        percentage: -1
    };
    
    
    return {
        //Function to create new item
        addItem: function(type,des,val){
            var newItem, ID;
            
            //[1,2,3,4,5], next ID = 6
            //[1,2,4,6,8], next ID = 9
            //ID = last ID + 1
            
            //Create new ID
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            //Create new item based on 'inc' or 'exp' type
            if(type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID,des,val);
            }
            
            //Push it into our data structure
            data.allItems[type].push(newItem);
            
            //Return our new element
            return newItem;
            
        },
        
        //Methord to delete item from the data structure
        deleteItem: function(type, id){
            //As the ID's cant be in order, we have to make an array with all the id numbers of inc and exp.
            //Difference b/w map and for each is that map returns a new array
            //id = 6
            //data.allItems[type][id];
            //ids = [1,2,4,6,8]
            //index = 3
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
               return current.id; 
            });
            
            index = ids.indexOf(id);
            //because index can be -1, if we dont find
            if(index !== -1) {
                //splice will remove id 3 and a single element
                data.allItems[type].splice(index,1);
            }
        },
        
        //Function to calculate total income and expenses
        calculateBudget: function(){
            
            //Calculate total income and expense
            calculateTotal('exp');
            calculateTotal('inc');
            
            //Calculate the budget:  income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that we spent and use condition to restrict the percentage if the income is 0
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
            
        },
        
        //Calculate the percentages
        calculatePercentages: function() {
            /*
            a=20
            b=10
            c=40
            income = 100
            a = 20/100 = 20%
            b = 10/100 = 10%
            c = 40/100 = 40%
            */
            data.allItems.exp.forEach(function(cur) {
               cur.calcPercentage(data.totals.inc); 
            });
        },
        
        //Get the calculated percentage
        getPercentages: function () {
            //Used map here because it stores and returns an array whereas the forEach does not
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        
        //Function to get data and use it in our UI
        getBudget: function(){
            //Created object to return all four properties
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();
//BUDGET CONTROLLER ENDS




//UI CONTROLLER
var UIController = (function(){
    
    //Objects to store strings at one location
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };
    
    //Function to do the number formatting
    var formatNumber = function(num, type) {
            var numSplit,int,dec,sign;
            /*
            + or - before the numbers
            exactly 2 decimal points
            comma separating the thousands
            2310.4347 -> 2,310.43
            */
            //Overwriting the num
            num = Math.abs(num);
            //Fix the decimal to 2, it gives out string
            num =  num.toFixed(2);
            //Comma separating 
            numSplit = num.split('.');
            
            int = numSplit[0];
            dec = numSplit[1];
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length-3,int.length); //input 2310 -> 2,310
            }
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
            };
            
            //The below callback function is assigned to this callback arg, in global scope
            var nodeListForEach = function(list, callback) {
                //So using this loop the callback function is called the length times
                for(var i=0; i< list.length; i++){
                    callback(list[i],i);
                }
            };
    
    return {
        getInput: function() {
            return {
                //To get the value either inc or exp
                type: document.querySelector(DOMstrings.inputType).value, 
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        
        //To add list items to the UI
        addListItem: function(obj, type) {
          var html, newHtml, element;
            
            //Create HTML string with placeholder text
            if(type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            
            //Replace the placeholder text with some actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml  = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);     
        },
        
        //Function to remove the element from the DOM
        deleteListItem: function(selectroID) {
            var el = document.getElementById(selectroID);
            el.parentNode.removeChild(el);
        },
        
        //To clear the fields after adding the values
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //To loop through fields and clear it at once we have to convert it to an array as queryselector returns a list
            //slice methord returns a copy of an array its called on, but it still uses array, we use slice methord using call methord and passing field variable into it using the this variable. Slice methord is in prototype of Array.
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current,index,array){
                current.value = "";   
            });
            
            //Shifts focus to description
            fieldsArr[0].focus; 
        },
        
        //function to return values to diplay on the UI
        displayBudget: function(obj){  
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);
            
            //We passed a callback function into it
            nodeListForEach(fields, function(current, index){
                //This code is going to run length times
                //First place, first percentage and so on
                if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
                }else {
                    current.textContent = '---';
                }
            });
        },
        
        //Function to add current date in UI
        displayMonth: function() {
            var now, year,month, months;
            months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            var now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(
            DOMstrings.inputType + ',' +
            DOMstrings.inputDescription + ',' +
            DOMstrings.inputValue);
            
            nodeListForEach(fields,function(cur) {
            cur.classList.toggle('red-focus');
        });
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },
        
        //Make the DOMstrings public
        getDOMstrings: function(){
            return DOMstrings;
        }
    };
    
})();
//UI CONTROLLER ENDS






//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
        //Functions for event listeners
        var setupEventListeners = function(){
        //Get the strings from UICtrl
        var DOM = UICtrl.getDOMstrings();
        //Event listener for click
        document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
    
        //Press enter (event listener) in global, event arg to keep the key press of enter 
        document.addEventListener('keypress', function(event){
            //Which for old browsers
            if(event.keyCode === 13 || event.which === 13){ 
                ctrlAddItem();
            }
        });
        
        //Event to click anywhere in the container
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        //Event to change color of forms while toggling b/w exp and inc
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    //Called each time a new object is added into the UI
    var updateBudget = function(){
        
        //1. Calculate the budget
        budgetController.calculateBudget();
        
        //2. Returns the budget
        var budget = budgetCtrl.getBudget();
        
        //3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };
    
    // Function to update the percentages after every expense
    var updatePercentages = function(){
        
        //1. Calculate percentage
        budgetController.calculatePercentages();
        
        //2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //Get the field input data
        input = UICtrl.getInput();
        
        //Condition to check if the input data is 0 or blank
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            //Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
        
            //Clear the fields
            UICtrl.clearFields();
        
            //Calculate and update budget
            updateBudget();
            
            //Calculate and update percentages
            updatePercentages();
        }
    };
    
    //Function to get the 4 x parent of the item clicked 
    var ctrlDeleteItem = function (event){
        //We add event here because we want to know what target element it and then use id property to get ID of that parent
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        //Condition possible as there are no ID's anywhere else in this container. ID has type and unique number eg 
        if(itemID) {
            //inc-1
            //Split converts the premitive to object so that different mathords can be used eg split: s-inc gives ['s','inc']
            splitID = itemID.split('-');
            type = splitID[0];
            //As ID has string value we convert to int
            ID = parseInt(splitID[1]);
            
            
            //1) Delete the item from the data structure
            budgetCtrl.deleteItem(type,ID);
            
            //2) Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            //3) Update and show the new budget
            updateBudget();
            
            //3)Update the percentages
            updatePercentages();
        }
        };
    
    
    return {
        //Created init because we want to start these functions every time the application starts 
        init: function(){
            console.log('We are in the application');
            //Call date function
            UICtrl.displayMonth();
            //Methord to display everything 0 as the page loads
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }  
    };
})(budgetController,UIController);
//GLOBAL APP CONTROLLER ENDS



// Called init function
controller.init(); 