export default class drawflowExtend{
    constructor(){
        this.data = {};
        this.nodesId = [];
        this.nodesIdNames = [];
        this.nodesNames = [];
        this.nodesMethod = [];
        this.nodesVariableType = [];
        this.nodesValueVar = [];
        this.nodesInputs = [];
        this.nodesOutputs = [];
        this.pythonCode = "new code"
    }

    reset(){
        this.data = {};
        this.nodesId = [];
        this.nodesIdNames = [];
        this.nodesNames = [];
        this.nodesMethod = [];
        this.nodesVariableType = [];
        this.nodesValueVar = [];
        this.nodesInputs = [];
        this.nodesOutputs = [];
        this.pythonCode = "new code"
    }

    executeNodeCode(objetoJSON){
        var {bool: bool_gn, Msg: Msg_gn} = this.getNodes(objetoJSON);
        if(bool_gn == false){
            return Msg_gn
        }
        var {bool: bool_vn, Msg: Msg_vn} = this.validateNodes();
        if(bool_vn == false){
            return Msg_vn
        }
        var {bool: bool_io, Msg: Msg_io} = this.validateInputsOutputs();
        if(bool_io == false){
            return Msg_io
        }

        var {bool: bool_ee, Msg: Msg_ee} = this.executionErrors();
        if(bool_ee == false){
            return Msg_ee
        }
        var Msg_ec = this.executeProgram();
        return Msg_ec
    }

    makePythonCode(objetoJSON){
        var {bool: bool_gn, Msg: Msg_gn} = this.getNodes(objetoJSON);
        if(bool_gn == false){
            return Msg_gn
        }
        var {bool: bool_vn, Msg: Msg_vn} = this.validateNodes();
        if(bool_vn == false){
            return Msg_vn
        }
        var {bool: bool_io, Msg: Msg_io} = this.validateInputsOutputs();
        if(bool_io == false){
            return Msg_io
        }

        var {bool: bool_ee, Msg: Msg_ee} = this.executionErrors();
        if(bool_ee == false){
            return Msg_ee
        }
        
        this.getPythonCode();
        return this.pythonCode
    }

    getNodes(objetoJSON){
        this.data = objetoJSON.drawflow.Home.data
        for (let node in this.data){
            this.nodesId.push(node);
            this.nodesIdNames.push(this.data[node].id);
            this.nodesNames.push("");
            this.nodesMethod.push("");
            this.nodesVariableType.push("");
            this.nodesValueVar.push("");
            this.nodesInputs.push([]);
            this.nodesOutputs.push([]);
        }
        if(this.nodesId.length <= 0){
            return {bool: false, Msg: "No nodes"}
        }
        return {bool: true, Msg: "No problems"}
    }

    validateNodes(){
        let valueType = "";
        let valuevar = '';
        var variableCheck = "";
        for (let nodeId in this.nodesId){
            valueType = '';
            valuevar = '';
            variableCheck = '';
            var thisNode = this.data[this.nodesId[nodeId]];
            this.nodesNames[nodeId] = thisNode.name;
            switch(thisNode.name){
                case 'Numeric':
                    if(Object.prototype.hasOwnProperty.call(thisNode.data, "data")){
                        if(Object.prototype.hasOwnProperty.call(thisNode.data.data, "method") == true){
                            //this.nodesMethod[nodeId] = thisNode.data.data.method;
                            this.nodesVariableType[nodeId] = thisNode.data.data.method;
                        }
                    } else {
                        return {bool: false, Msg: 'Select variable type of Numeric node'}
                    }

                    if(Object.prototype.hasOwnProperty.call(thisNode.data,"valuevar")){
                        this.nodesValueVar[nodeId] = thisNode.data.valuevar;
                    } else {
                        return {bool: false, Msg: 'Write a value in Numeric Node'}
                    }
                    valuevar = this.nodesValueVar[nodeId];
                    valueType = this.nodesVariableType[nodeId];
            
                    variableCheck = valuevar.match(/^\d+(\.\d+)/g);
                    if(variableCheck != null){
                        if(variableCheck[0].length != valuevar.length){
                            return {bool: false, Msg: 'Variable float in Numeric Node is not correct'};
                        }
                        if(valueType == 'int'){
                            return {bool: false, Msg: 'Variable float in Numeric Node but requires int'};
                        }
                        continue;
                    }
                    
                    variableCheck = valuevar.match(/^\d+/g);
                    if(variableCheck != null){
                        if(valuevar.includes('.') == true){
                            return {bool: false, Msg: 'Variable float not complete'};
                        }
                        if(variableCheck[0].length != valuevar.length ){
                            return {bool: false, Msg: 'Variable int in Numeric Node is not correct'};
                        }
                        if(valueType == 'float'){
                            return {bool: false, Msg: 'Variable int in Numeric Node but requires float'};
                        }
                        continue;
                    }else{
                        return {bool: false, Msg: "Variable in Numeric Node is not a number"};
                    }

                case 'Logic':
                    if(Object.prototype.hasOwnProperty.call(thisNode.data,"data") == true){
                        if(Object.prototype.hasOwnProperty.call(thisNode.data.data,"method") == true){
                            this.nodesMethod[nodeId] = thisNode.data.data.method;
                        }
                    } else {
                        return {bool: false, Msg: "Select operation in Logic node"};
                    }
                break;

                case 'Math':
                    if(Object.prototype.hasOwnProperty.call(thisNode.data,"data") == true){
                        if(Object.prototype.hasOwnProperty.call(thisNode.data.data,"method") == true){
                            this.nodesMethod[nodeId] = thisNode.data.data.method;
                        }
                    } else {
                        return {bool: false, Msg: "Select operation in Math node"};
                    }
                break;

                default: break;
            }
        }
        return {bool: true, Msg: "Nodes validated"}
    }

    validateInputsOutputs(){
        let numberInputsOutputs = 0
        let inputOutputName = ''
        let nodeName = ''
        var inputOutput = ['inputs', 'outputs']
        var hasInputOutput = [false, false]
        var IO = 'inputs'
        for (let nodeId in this.nodesId){
            let thisNode = this.data[this.nodesId[nodeId]];
            hasInputOutput[0] = (Object.keys(thisNode.inputs).length != 0);
            hasInputOutput[1] = (Object.keys(thisNode.outputs).length != 0);

            for (let i = 0; i < 2; i++){
                IO = inputOutput[i]
                if(hasInputOutput[i]){
                    let inputsOutputs = Object.keys(thisNode[IO])
                    for (let inputOutput in inputsOutputs){
                        numberInputsOutputs = Object.keys(thisNode[IO][inputsOutputs[inputOutput]].connections).length;
                        inputOutputName = JSON.stringify(inputsOutputs[inputOutput]);
                        nodeName = thisNode.name;
                        if(numberInputsOutputs == 0){
                            if(IO == 'outputs' && nodeName == 'Numeric'){
                                return {bool: false, Msg: 'It is missing a connection in ' + inputOutputName + " from the node " +  nodeName};
                            }
                            if(IO == 'inputs'){
                                return {bool: false, Msg: 'It is missing a connection in ' + inputOutputName + " from the node " +  nodeName};
                            }
                        }
                        if(numberInputsOutputs > 1){
                            if(IO != 'outputs'){
                                return {bool: false, Msg: 'There are too many connections in ' + inputOutputName + " from the node " +  nodeName};
                            }
                        }
                        if(IO == 'inputs' && this.nodesNames[nodeId] != 'Numeric'){
                            inputOutputName = inputOutputName.replaceAll('"', '');
                            var inputNodeName = thisNode[IO][inputOutputName].connections[0].node;
                            this.nodesInputs[nodeId].push(inputNodeName)  
                        }
                    }
                }
            }
        }
        return {bool: true, Msg: 'Inputs and Outputs validated'}
    }

    executionErrors(){
        var checkNodes = [];
        var checkTypes = [];
        let rootId = this.getRoot();

        var len = this.nodesId.length;
        for(let i = 0; i < len; i++){
            checkNodes.push(false);
            checkTypes.push('');
        }

        function check(nodeId, thisNodesId, thisNodesNames, thisNodesInputs){
            if(checkNodes[nodeId] == true){
                return {bool: true, Msg: checkTypes[nodeId]};
            }
            if(thisNodesNames[nodeId] == "Numeric"){
                checkNodes[nodeId] = true;
                checkTypes[nodeId] = 'Numeric'
                return {bool: true, Msg: 'Numeric'};
            }

            var nodeIdName = "";
            var newNodeId = 0;
            var inputsTypes = [];
            for (let input in thisNodesInputs[nodeId]){
                nodeIdName = thisNodesInputs[nodeId][input];
                newNodeId = thisNodesId.indexOf(nodeIdName);
                let {bool, Msg} = check(newNodeId, thisNodesId, thisNodesNames, thisNodesInputs);
                if(bool == false){
                    return {bool, Msg};
                } else {
                    inputsTypes.push(Msg);
                }
            }
            checkNodes[nodeId] = true;

            switch(thisNodesNames[nodeId]){
                case 'Logic':
                    if(inputsTypes[0] != 'Logic' && inputsTypes[1] != 'Logic'){
                        return {bool: true, Msg: 'Logic'};
                    } 
                    return {bool: false, Msg: 'Execution Error: not all the inputs have a Numeric outputs'};
                case 'Math':
                    if(inputsTypes[0] != 'Logic' && inputsTypes[1] != 'Logic'){
                        return {bool: true, Msg: 'Math'};
                    }
                    return {bool: false, Msg: 'Execution Error: there are inputs not valid'};
                case 'FOR':
                    if(inputsTypes[0] != 'Logic' && inputsTypes[1] != 'Logic' && inputsTypes[2] == 'Math'){
                        return {bool: true, Msg: "Numeric"};
                    }
                    if(inputsTypes[0] == 'Logic'){
                        return {bool: false, Msg: "Execution Error: there is Logic node in input_1 of the FOR node"};
                    }
                    if(inputsTypes[1] == 'Logic'){
                        return {bool: false, Msg: "Execution Error: there is Logic node in input_2 of the FOR node"};
                    }
                    if(inputsTypes[2] != 'Math'){
                        return {bool: false, Msg: "Execution Error: a Math node in requiered in input_3 of the FOR node"};
                    }
                    break;
                case 'IFELSE':
                    if(inputsTypes[0] != 'Logic'){
                        return {bool: false, Msg: 'Execution Error: a Logic value in required in input_1 of the IF/ELSE node'};
                    }
                    if(inputsTypes[1] != 'Logic' && inputsTypes[2] != 'Logic'){
                        return {bool: true, Msg:'Numeric'};
                    }
                    if(inputsTypes[1] == 'Logic' && inputsTypes[2] == 'Logic'){
                        return {bool: true, Msg:'Logic'};
                    }
                    return {bool: true, Msg: 'Execution Error: the inputs of the IF/ELSE node are not the same'};
                default: 
                    return {bool: false, Msg: "Name not recognized"}
            }
        }

        let{bool, Msg} = check(rootId, this.nodesId, this.nodesNames, this.nodesInputs);
        if (bool == false){
            return {bool, Msg}
        }
        return {bool: true, Msg: 'No execution errors'}
    }

    executeProgram(){
        let logicOperators = this.logicOperators;
        let mathOperations = this.mathOperations;

        function forNode(forinit, forend, number1, number2, method){
            console.log(forinit);
            console.log(forend);
            console.log(number1);
            console.log(number2);
            console.log(method);
            var forresult = number1
            for(let i = forinit; i < forend; i++){
                forresult = mathOperations(number1, number2, method)
                number1 = forresult
            }
            console.log(forresult);
            console.log(String(forresult));
            return forresult.toString();
        }

        var rootId = this.getRoot();
        
        function check(nodeId, thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, execute){
            if(thisNodesNames[nodeId] == 'Numeric'){
                if(execute == true){
                    return thisNodesValueVar[nodeId];
                }
                return 'Numeric,'+thisNodesValueVar[nodeId] + ',';
            }

            var nodeIdName = "";
            var newNodeId = 0;
            var inputsId = [];
            for (let input in thisNodesInputs[nodeId]){
                nodeIdName = thisNodesInputs[nodeId][input];
                newNodeId = thisNodesId.indexOf(nodeIdName);
                inputsId.push(newNodeId);
            }

            var number1 = "";
            var number2 = "";
            var method = "";
            var result = "";
            var number1Numeric = 0;
            var number2Numeric = 0;

            switch(thisNodesNames[nodeId]){
                case 'Logic':
                    number1 = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, execute);
                    number2 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, execute);
                    method = thisNodesMethod[nodeId];
                    if(execute == true){
                        result = logicOperators(parseFloat(number1), parseFloat(number2), method);
                        return result.toString();
                    }
                    return 'Logic,' + number1 + number2 + method + ',';
                case 'Math':
                    number1 = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, execute);
                    number2 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, execute);
                    method = thisNodesMethod[nodeId];
                    if(execute == true){
                        result = mathOperations(parseFloat(number1), parseFloat(number2), method);
                        return result.toString();
                    }
                    return 'Math,' + number1 + number2 + method + ',';
                case 'FOR':
                    var init = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, true);
                    var end = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, true);
                    var functionMath = check(inputsId[2], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, false);
                    var parameters = functionMath.split(',');
                    //console.log(parameters);
                    number1 = parameters[2];
                    number2 = parameters[4];
                    method = parameters[5];
                    number1Numeric = parseFloat(number1);
                    number2Numeric = parseFloat(number2);
                    if(execute == true){
                        return forNode(Math.round(parseFloat(init)), Math.round(parseFloat(end)), number1Numeric, number2Numeric, method);
                    }
                    return 'FOR,' + init + ',' + end + ',' + number1 + ',' + number2 + ',' + method + ',';
                case 'IFELSE':
                    var condition = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, true);
                    var function1 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, false);
                    var function2 = check(inputsId[2], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesValueVar, thisNodesMethod, false);
                    var finalFunction = "";

                    finalFunction = condition == "true" ? function1 : function2;
                    if(execute == false){
                        return finalFunction;
                    }

                    parameters = finalFunction.split(',');
                    switch(parameters[0]){
                        case 'Logic':
                            number1 = parameters[2];
                            number2 = parameters[4];
                            method = parameters[5];
                            result = logicOperators(parseFloat(number1), parseFloat(number2), method);
                            return result.toString();

                        case 'Math':
                            number1 = parameters[2];
                            number2 = parameters[4];
                            method = parameters[5];
                            result = mathOperations(parseFloat(number1), parseFloat(number2), method);
                            return result.toString();

                        case 'FOR':
                            console.log(parameters);
                            init = Math.round( parseFloat( parameters[1] ) );
                            end = Math.round( parseFloat( parameters[2] ) );
                            number1 = parseFloat( parameters[3] );
                            number2 = parseFloat( parameters[4] );
                            method = parameters[5];
                            return forNode(init, end, number1, number2, method);
                        case 'Numeric':
                            return parameters[1];
                        default: break;
                    }
                    break;

                default: break;
            }
        }

        var finalresult = "";
        finalresult = check(rootId, this.nodesId, this.nodesNames, this.nodesInputs, this.nodesValueVar, this.nodesMethod, true);
        return finalresult;
    }

    getPythonCode(){
        let mathOperationsPython = this.mathOperationsPython;
        let logicOperatorsPython = this.logicOperatorsPython;
        let getNamePython = this.getNamePython;
        let indentCode = this.indentCode;
        let rootId = this.getRoot();
 
        var numberList = [];
        var numberListValues = [];

        function check(nodeId, thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, isFor){
            if(thisNodesNames[nodeId] == 'Numeric'){
                var varName = 'N' + thisNodesId[nodeId];
                if(numberList.indexOf(varName) == -1){
                    numberList.push(varName);
                    numberListValues.push(thisNodesValueVar[nodeId]);
                }
                return varName;
            }

            var nodeIdName = "";
            var newNodeId = 0;
            var inputsId = [];
            for (let input in thisNodesInputs[nodeId]){
                nodeIdName = thisNodesInputs[nodeId][input];
                newNodeId = thisNodesId.indexOf(nodeIdName);
                inputsId.push(newNodeId);
            }

            var number1 = "";
            var number2 = "";
            var method = "";
            var nameLong = "";
            var nameShort = "";
            var out1 = "";
            var out2 = ""
            var inpt1 = "";
            var inpt2 = "";

            switch(thisNodesNames[nodeId]){
                case 'Logic':
                    number1 = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    number2 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    method = thisNodesMethod[nodeId];

                    nameLong = thisNodesNames[inputsId[0]];
                    nameShort = getNamePython(nameLong);
                    if(nameShort != 'N'){
                        inpt1 = number1;
                        number1 = nameShort + thisNodesId[inputsId[0]];  
                    }

                    nameLong = thisNodesNames[inputsId[1]];
                    nameShort = getNamePython(nameLong);
                    if(nameShort != 'N'){
                        inpt2 = number2;
                        number2 = nameShort + thisNodesId[inputsId[1]];  
                    }

                    return inpt1 + inpt2 + "\nL" + thisNodesId[nodeId] + " = ( " + number1 + ' ' + logicOperatorsPython(method) + ' '+number2 + " )"
                case 'Math':
                    var MathStr = "";
                    number1 = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    number2 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    method = thisNodesMethod[nodeId];
   
                    nameLong = thisNodesNames[inputsId[0]];
                    nameShort = getNamePython(nameLong);
                    var out = nameShort + thisNodesId[nodeId];
                    if(nameShort != 'N'){
                        MathStr = MathStr + number2;
                        number1 = out;
                    }

                    nameLong = thisNodesNames[inputsId[1]];
                    nameShort = getNamePython(nameLong);
                    out = nameShort + thisNodesId[inputsId[1]];
                    if(nameShort != 'N'){
                        MathStr = MathStr + number2;
                        number2 = out;
                    }

                    if(isFor == true){
                        return number1 + "," + number2 + "," + method + ',';
                    } else {
                        return MathStr + "\nM" + thisNodesId[nodeId] + " = " + number1 + ' ' + mathOperationsPython(method) + ' ' + number2;
                    }
                case 'FOR':
                    var init = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    var end = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    var functionMath = check(inputsId[2], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, true);
                    var operations = functionMath.split(',');

                    nameLong = thisNodesNames[inputsId[0]];
                    nameShort = getNamePython(nameLong);
                    if(nameShort != 'N'){
                        inpt1 = init;
                        init = nameShort + thisNodesId[inputsId[0]];  
                    }

                    nameLong = thisNodesNames[inputsId[1]];
                    nameShort = getNamePython(nameLong);
                    if(nameShort != 'N'){
                        inpt2 = end;
                        end = nameShort + thisNodesId[inputsId[1]];  
                    }

                    return inpt1 + inpt2 + '\nF' + thisNodesId[nodeId] + " = " + operations[0] + '\nfor _ in range(' + init + ', ' + end + ')' + ':' + '\n\tF' + thisNodesId[nodeId] + ' = F' + thisNodesId[nodeId] + ' '+mathOperationsPython(operations[2])+' '+operations[1];
                case 'IFELSE':
                    var IEout = "\nIE" + thisNodesId[nodeId] + "=";
                    var condition = check(inputsId[0], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    var function1 = check(inputsId[1], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    var function2 = check(inputsId[2], thisNodesId, thisNodesNames, thisNodesInputs, thisNodesMethod, thisNodesValueVar, false);
                    
                    nameLong = thisNodesNames[inputsId[1]];
                    nameShort = getNamePython(nameLong);
                    out1 = nameShort + thisNodesId[inputsId[1]];
                    out1 = (nameShort == 'N') ? IEout + out1 : function1 + IEout + out1;

                    nameLong = thisNodesNames[inputsId[2]];
                    nameShort = getNamePython(nameLong);
                    out2 = nameShort + thisNodesId[inputsId[2]];
                    out2 = (nameShort == 'N') ? IEout + out2 : function2 + IEout + out2;

                    out1 = indentCode(out1);
                    out2 = indentCode(out2);

                    return condition + "\nif(L" + thisNodesId[inputsId[0]] + "):" + out1 + " \nelse:" + out2;

            }
            return 'Node not found';
        }

        var execute_root = (this.nodesNames[rootId] == 'FOR') ? true : false;
        let program = check(rootId, this.nodesId, this.nodesNames, this.nodesInputs, this.nodesMethod, this.nodesValueVar, execute_root);

        var globalVars = "";
        for(let pos = 0; pos <  numberList.length; pos++){
            globalVars = globalVars + "\n" + numberList[pos]+" = "+numberListValues[pos];
        }

        var printResult = '\nprint(' + getNamePython(this.nodesNames[rootId]) + this.nodesId[rootId] + ')';
        program = globalVars + program + printResult;
        this.pythonCode = program;
    }

    getRoot(){
        var checkNodes = []
        var checkNumbers = []

        var len = this.nodesId.length;
        for(let i = 0; i < len; i++){
            checkNodes.push(false);
            checkNumbers.push(0);
        }

        function check(nodeId, thisNodesId, thisNodesNames, thisNodesInputs){
            if(thisNodesNames[nodeId] == "Numeric"){
                checkNodes[nodeId] = true;
                checkNumbers[nodeId] = 1;
                return 1;
            }

            if(checkNodes[nodeId] == true){
                return checkNumbers[nodeId];
            }

            var nodeIdName = "";
            var newNodeId = 0;
            var numberChecks = 0;
            for (let input in thisNodesInputs[nodeId]){
                nodeIdName = thisNodesInputs[nodeId][input];
                newNodeId = thisNodesId.indexOf(nodeIdName);
                numberChecks += check(newNodeId, thisNodesId, thisNodesNames, thisNodesInputs);
            }

            checkNodes[nodeId] = true;
            checkNumbers[nodeId] = numberChecks;
            return numberChecks;
        }

        for (let nodeId in this.nodesId){
            check(nodeId, this.nodesId, this.nodesNames, this.nodesInputs);
        }

        var max = -1;
        var root = -1;
        for (let id in checkNumbers){
            if(checkNumbers[id] > max){
                root = id;
                max = checkNumbers[id]; 
            }
        }

        return root;
    }

    logicOperators(number1, number2, method){
        switch(method){
            case 'is equal to':
                return number1 == number2;
            case 'is less than':
                return number1 < number2;
            case 'is greater than':
                return number1 > number2;
            case 'is less or equal than':
                return number1 <= number2;
            case 'is greater or equal than':
                return number1 >= number2;
        }
    }

    mathOperations(number1, number2, method){
        switch(method){
            case 'sum':
                return number1 + number2;
            case 'rest':
                return number1 - number2;
            case 'multiplication':
                return number1 * number2;
            case 'divide':
                return number1 / number2;
            case 'pow':
                return Math.pow(number1, number2);
        }
    }

    logicOperatorsPython(method){
        switch(method){
            case 'is equal to':
                return '==';
            case 'is less than':
                return "<";
            case 'is greater than':
                return ">";
            case 'is less or equal than':
                return '<=';
            case 'is greater or equal than':
                return '>=';
        }
    }

    mathOperationsPython(method){
        switch(method){
            case 'sum':
                return '+';
            case 'rest':
                return '-';
            case 'multiplication':
                return '*';
            case 'divide':
                return '/';
            case 'pow':
                return '**';
        }
    }

    getNamePython(name){
        switch(name){
            case 'Numeric':
                return 'N';
            case 'Logic':
                return 'L'
            case 'FOR':
                return 'F'
            case 'IFELSE':
                return 'IE'
            case 'Math':
                return 'M'
        }
    }

    indentCode(pythonCode){ 
        var pyhtonCode_new = pythonCode.replaceAll("\n", "\n\t") 
        return pyhtonCode_new
    }
}