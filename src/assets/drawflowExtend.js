export default class drawflowExtend{
    constructor(){
        this.mensaje = 'funcion';
        this.nodes = [];
        this.data = {};
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

        var {bool: bool_ct, Msg: Msg_ct } = this.createTree();
        if(bool_ct == false){
            return Msg_ct
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

        var {bool: bool_ct, Msg: Msg_ct } = this.createTree();
        if(bool_ct == false){
            return Msg_ct
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
        this.nodes = [];
        var i = 0;
        for (let node in this.data){
            this.nodes[i] = node;
            i++;
        }
        if(this.nodes.length <= 0){
            return {bool: false, Msg: "No nodes"}
        }
        return {bool: true, Msg: "No problems"}
    }

    validateNodes(){
        let method = ''
        let variable = ''
        var variableType = ""
        for (let node in this.nodes){
            method = '';
            variable = '';
            let thisNode = this.data[this.nodes[node]];
            if (JSON.stringify( thisNode.name ) == '"Numeric"' ){
                if ( JSON.stringify(thisNode.data).includes("method") ){
                    method = JSON.stringify(thisNode.data.data.method).replace(/"/g, '')
                }
                else{
                    return {bool: false, Msg: 'Select variable type of Numeric node'}
                }
                if(JSON.stringify(thisNode.data).includes("valuevar")){
                    variable = JSON.stringify(thisNode.data.valuevar).replace(/"/g, '')
                }
                else{
                    return {bool: false, Msg: 'Write a value in Numeric Node'}
                }
                
                variableType = variable.match(/^\d+(\.\d+)/g)
                if(variableType != null){
                    if(variableType[0].length != variable.length){
                        return {bool: false, Msg: 'Variable float in Numeric Node is not correct'}
                    }
                    if(method == 'int'){
                        return {bool: false, Msg: 'Variable float in Numeric Node but requires int'}
                    }
                    continue;
                }
                
                variableType = variable.match(/^\d+/g)
                if(variableType != null){
                    if(variable.includes('.') == true){
                        return {bool: false, Msg: 'Variable float not complete'}
                    }
                    if(variableType[0].length != variable.length ){
                        return {bool: false, Msg: 'Variable int in Numeric Node is not correct'}
                    }
                    if(method == 'float'){
                        return {bool: false, Msg: 'Variable int in Numeric Node but requires float'}
                    }
                    continue;
                }else{
                    return {bool: false, Msg: "Variable in Numeric Node is not a number"}
                }
            }
            if (JSON.stringify( thisNode.name ) == "\"Math\"" ){
                if(JSON.stringify(thisNode).includes("method") == false){
                    return {bool: false, Msg: "Select operation in Math node"}
                }
            }
            if (JSON.stringify( thisNode.name ) == "\"Logic\"" ){
                if(JSON.stringify(thisNode).includes('method') == false)
                {
                    return {bool: false, Msg: "Select operation in Logic node"}
                }
            }
        }
        return {bool: true, Msg: "Nodes validated"}
    }

    validateInputsOutputs(){
        let numberkeys = 0
        let inputOutputName = ''
        let nodeName = ''
        var inputOutput = ['inputs', 'outputs']
        var hasInputOutput = [false, false]
        var IO = 'inputs'
        for (let node in this.nodes){
            let thisNode = this.data[this.nodes[node]];
            hasInputOutput[0] = (Object.keys(thisNode.inputs).length != 0);
            hasInputOutput[1] = (Object.keys(thisNode.outputs).length != 0);

            for (let i = 0; i < 2; i++){
                IO = inputOutput[i]
                if(hasInputOutput[i]){
                    let thisNodeKeys = Object.keys(thisNode[IO])
                    for (let thisNodeKey in thisNodeKeys){
                        numberkeys = Object.keys(thisNode[IO][thisNodeKeys[thisNodeKey]].connections).length
                        inputOutputName = JSON.stringify(thisNodeKeys[thisNodeKey])
                        nodeName = thisNode.name
                        if(numberkeys == 0){
                            if((IO == 'outputs') && (nodeName == 'Numeric')){
                                return {bool: false, Msg: 'It is missing a connection in ' + inputOutputName + " from the node " +  nodeName}
                            }
                        }
                        if(numberkeys > 1){
                            if(IO != 'outputs'){
                                return {bool: false, Msg: 'There are too many connections in ' + inputOutputName + " from the node " +  nodeName}
                            }
                        }
                    }
                }
            }
        }
        return {bool: true, Msg: 'Inputs and Outputs validated'}
    }

    createTree(){
        let branchName = "";
        let branchNodes = [];
        let thisTree = [];
        let branchposition = 0;

        thisTree[branchName] = branchNodes
        this.tree = [["", []]]
      
        var numberNodes = Object.keys(this.data).length
        for(let position = 0; position < numberNodes; position++){
            var node = Object.keys(this.data)[position]
            if(Object.values(this.data[node].inputs).length > 0){
                var numberInputs = Object.keys(this.data[node].inputs).length
                branchName = '';
                branchNodes = [];
                thisTree = [];
                for(let input = 0; input < numberInputs; input++){
                    var connectionslength = Object.values(this.data[node].inputs)[input].connections.length
                    if (connectionslength != 0){
                        branchName = JSON.stringify(node).replace(/"/g, '\'')
                        branchNodes.push(JSON.stringify(Object.values(Object.values(this.data[node].inputs)[input].connections)[0].node).replace(/"/g, ''))
                    }
                }
                if(branchNodes.length > 0){
                    thisTree[branchName] = branchNodes
                    this.tree[branchposition] = thisTree
                    branchposition++
                }
            }
        }
        if(this.tree[0][0] == "" && this.tree[0][1].length == 0){
            return {bool: false, Msg: "There are only Numeric Nodes"}
        }else{
            return {bool: true, Msg: "Tree created without problems"}
        }
    }

    executionErrors(){
        var treeCheck = []
        var treeCheckNames = []
        var keyNode = ""
        var nodeName = ""
        var nameInput = ""
        var numberNodes = this.tree.length
        var nodeNames = []

        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            nodeNames[i] = nodeName
            treeCheck[i] = false
            treeCheckNames[i] = this.getName(nodeName, this.nodes, this.data)
        }

        function check(checkNodeName, tree){
            var inputs = []
            var positionNode = nodeNames.indexOf(checkNodeName)
            if( positionNode == -1){
                
                return {bool: true, Msg: 'Numeric'}
            }
            else{
                if(treeCheck[positionNode] == true){
                    return {bool: true, Msg: treeCheckNames[positionNode]}
                }
                
                var keyNode = JSON.stringify(Object.keys(tree)[positionNode]).replace(/"/g, '')
                var numberInputs = Object.values(tree[keyNode])[0].length
                
                for (let j = 0; j < numberInputs; j++){
                    nameInput = Object.values(tree[keyNode])[0][j]
                    let {bool, Msg} = check(nameInput, tree)
                    if(bool == false){
                        return {bool, Msg}
                    }
                    else{
                        inputs.push(Msg)
                    }
                }
                treeCheck[positionNode] = true
                var inputValidation1 = ((inputs[0] == 'FOR') || (inputs[0] == 'Numeric') || (inputs[0] == 'Math'))
                var inputValidation2 = ((inputs[1] == 'FOR') || (inputs[1] == 'Numeric') || (inputs[1] == 'Math'))
                
                switch(treeCheckNames[positionNode]){
                    case 'Logic':
                        if((inputValidation1 == true) && (inputValidation2 == true) ){
                            return {bool: true, Msg: 'Logic'}
                        }
                        else{
                            return {bool: false, Msg: "Execution Error: Nodes in inputs of Logic Node must return a Numeric value"}
                        }
                    case 'Math':
                        if(inputValidation1 != inputValidation2){
                            return {bool: false, Msg: "Execution Error: inputs are not the same in the Math Node"}
                        }
                        else{
                            return {bool: true, Msg: 'Math'}
                        }
                    case 'FOR':
                        if(inputs[2] != 'Math'){
                            return {bool: false, Msg: "Execution Error: For Node only accepts a Math node"}
                        }
                        else{
                            return {bool: true, Msg: 'For'}
                        }
                    case 'IFELSE':
                        if(inputs[0] != 'Logic'){
                            return {bool: false, Msg: "Execution Error: the IF/ELSE Node requires a Logic Node in 'input_1'"}
                        }

                        inputValidation1 = ((inputs[1] == 'FOR') || (inputs[1] == 'Numeric') || (inputs[1] == 'Math'));
                        inputValidation2 = ((inputs[2] == 'FOR') || (inputs[2] == 'Numeric') || (inputs[2] == 'Math'));
                        if( (inputValidation1 == true) && (inputValidation2 == true)){
                            treeCheckNames[positionNode] = 'Numeric'
                            return {bool: true, Msg: 'Numeric'}
                        }
                        if(inputs[1] != inputs[2]){
                            return {bool: false, Msg: "error: inputs are not the same in the IFELSE node"}
                        }
                        else{
                            treeCheckNames[positionNode] = 'Logic'
                            return {bool: true, Msg: 'Logic'}
                        }
                }
                return {bool: false, Msg: "Node type not found, modify drawflowExtend.js to add a new node"}
            }
        }
        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            let{bool, Msg} = check(nodeName, this.tree);
            if (bool == false){
                return {bool, Msg}
            }
        }
        return {bool: true, Msg: 'No execution errors'}
    }

    executeProgram(){
        var treeCheck = []
        var treeCheckNames = []
        var keyNode = ""
        var nodeName = ""
        var nameInput = ""
        var numberNodes = this.tree.length
        var nodeNames = []

        let positionRoot = this.getRoot()

        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            nodeNames[i] = nodeName
            treeCheck[i] = false
            treeCheckNames[i] = this.getName(nodeName, this.nodes, this.data)
        }

        let getValue = this.getValue
        let getName = this.getName
        let mathOperations = this.mathOperations
        let logicOperators = this.logicOperators
        let getMethod = this.getMethod

        function forNode(forinit, forend, number1, number2, method){
            let forresult = number1
            for(let i = forinit; i < forend; i++){
                forresult = mathOperations(number1, number2, method)
                number1 = forresult
            }
            return forresult
        }

        function check(checkNodeName, tree, data, nodes, execute){
            if(getName(checkNodeName, nodes, data) == 'Numeric'){
                if(execute == true){
                    return getValue(checkNodeName, nodes, data)
                }else{
                    return "Numeric," + getValue(checkNodeName, nodes, data) + ","
                }
            }
            
            var inputNodeNames = []
            var positionNode = nodeNames.indexOf(checkNodeName)
            var keyNode = JSON.stringify(Object.keys(tree)[positionNode]).replace(/"/g, '')            
            var numberInputs = Object.values(tree[keyNode])[0].length

            for (let j = 0; j < numberInputs; j++){
                nameInput = Object.values(tree[keyNode])[0][j]
                inputNodeNames.push(nameInput)
            }
            var number1 = "";
            var number2 = "";
            var method = "";
            var result = "";
            var number1Numeric = 0;
            var number2Numeric = 0;
            var startStr = 0;
            var endStr = 0;
            var typeNodeEnd = 0;
            var typeNode = '';
            switch(treeCheckNames[positionNode]){
                case 'Logic':
                    number1 = check(inputNodeNames[0], tree, data, nodes, execute)
                    number2 = check(inputNodeNames[1], tree, data, nodes, execute)
                    method = getMethod(checkNodeName, nodes, data)
                    if(execute == true){
                        result = logicOperators( parseFloat(number1), parseFloat(number2), method)
                        return result.toString()
                    }else{
                        return 'Logic,' + number1 + ',' + number2 + ',' + method + ','
                    }
                case 'Math':
                    number1 = check(inputNodeNames[0], tree, data, nodes, execute)
                    number2 = check(inputNodeNames[1], tree, data, nodes, execute)
                    method = getMethod(checkNodeName, nodes, data)
                    if(execute == true){
                        result = mathOperations( parseFloat(number1), parseFloat(number2), method)
                        return result.toString()
                    }else{
                        return 'Math,' + number1 + number2 + method + ','
                    }
                case 'FOR':
                    var init = check(inputNodeNames[0], tree, data, nodes, true)
                    var end = check(inputNodeNames[1], tree, data, nodes, true)
                    var functionMath = check(inputNodeNames[2], tree, data, nodes, false)
                    typeNodeEnd = functionMath.indexOf(",")
                    typeNode = functionMath.substring(0, typeNodeEnd)
                        
                    startStr = 0;
                    endStr = 0;

                    var parameters = functionMath.split(",");
                    number1 = parameters[2];
                    number2 = parameters[4];
                    method = parameters[5];
                    number1Numeric = parseFloat(number1);
                    number2Numeric = parseFloat(number2);
                    if(execute == true){
                        return forNode(Math.round(parseFloat(init)), Math.round(parseFloat(end)), number1Numeric, number2Numeric, method).toString()
                    }else{
                        return 'FOR,'+init+','+end+','+number1+','+number2+','+method+','
                    }
                case 'IFELSE':
                    
                    var condition = check(inputNodeNames[0], tree, data, nodes, true)
                    var function1 = check(inputNodeNames[1], tree, data, nodes, false)
                    var function2 = check(inputNodeNames[2], tree, data, nodes, false)
                    var finalFunction = ""
                    
                    if(condition == "true"){
                        finalFunction = function1
                    }else{
                        finalFunction = function2
                    }

                    if(execute == false){
                        return finalFunction
                    }else{
                        typeNodeEnd = finalFunction.indexOf(",")
                        typeNode = finalFunction.substring(0, typeNodeEnd)

                        startStr = 0;
                        endStr = 0;
                        if(typeNode == "Numeric"){
                            startStr = finalFunction.indexOf(",")
                            endStr = finalFunction.indexOf(",",++startStr)
                            return finalFunction.substring(startStr, endStr)
                        }

                        var operation = []

                        if(typeNode != "FOR"){
                            startStr = finalFunction.indexOf(",")
                            
                            for (let i = 0; i < 3; i++){
                                endStr = finalFunction.indexOf(",",++startStr)
                                operation.push(finalFunction.substring(startStr, endStr))
                                startStr = endStr
                            }
                            if(inputNodeNames[1] == 'int'){
                                number1Numeric = parseInt(operation[0])
                            }else{
                                number1Numeric = parseFloat(operation[0])
                            }
                            if(inputNodeNames[2] == 'int'){
                                number2Numeric = parseInt(operation[1])
                            }else{
                                number2Numeric = parseFloat(operation[1])
                            }
                        
                            if(typeNode == "Logic"){
                                console.log( logicOperators( parseFloat(operation[0]), parseFloat(operation[1]),  operation[2] ) )
                                return logicOperators( number1Numeric, number2Numeric,  operation[2] ).toString()
                            }
                            if(typeNode == "Math"){
                                return mathOperations( number1Numeric, number2Numeric,  operation[2] ).toString()
                            }
                        }
                        
                        if(typeNode == 'FOR'){
                            startStr = finalFunction.indexOf(",")
                            for (let i = 0; i < 7; i++){
                                endStr = finalFunction.indexOf(",",++startStr)
                                operation.push(finalFunction.substring(startStr, endStr))
                                startStr = endStr
                            }
                            return forNode(Math.round(parseFloat(operation[0])), Math.round(parseFloat(operation[1])), parseFloat(operation[2]), parseFloat(operation[3]), operation[4])
                        }
                    }
            }
            return "Node not found"
        }

        var nodeNameRoot = nodeNames[parseInt(positionRoot)]
        let finalResult = ""
        finalResult = check(nodeNameRoot, this.tree, this.data, this.nodes, true);
        return finalResult 
    }

    getPythonCode(){
        var treeCheck = []
        var treeCheckNames = []
        var numberInputs = 0
        var keyNode = ""
        var nodeName = ""
        var nameInput = ""
        var numberNodes = this.tree.length
        var nodeNames = []
        var numberList = []
        var numberListValues = []

        let positionRoot = this.getRoot()

        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            nodeNames[i] = nodeName
            treeCheck[i] = false
            treeCheckNames[i] = this.getName(nodeName, this.nodes, this.data)
        }

        let getValue = this.getValue
        let getName = this.getName
        let mathOperationsPython = this.mathOperationsPython
        let logicOperatorsPython = this.logicOperatorsPython
        let getMethod = this.getMethod
        let getNamePython = this.getNamePython
        let indentCode = this.indentCode

        function check(checkNodeName, tree, data, nodes, For){
            if(getName(checkNodeName, nodes, data) == 'Numeric'){
                var numberName = "N" + checkNodeName
                if(numberList.indexOf(numberName) == -1){
                    numberList.push(numberName)
                    numberListValues.push(getValue(checkNodeName, nodes, data))
                }        
                return numberName
            }
            
            var inputNodeNames = []
            var positionNode = nodeNames.indexOf(checkNodeName)
            keyNode = JSON.stringify(Object.keys(tree)[positionNode]).replace(/"/g, '')            
            nodeName = JSON.stringify(Object.keys(tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            numberInputs = Object.values(tree[keyNode])[0].length

            for (let j = 0; j < numberInputs; j++){
                nameInput = Object.values(tree[keyNode])[0][j]
                inputNodeNames.push(nameInput)
            }
            var number1 = "";
            var number2 = "";
            var method = "";
            var nameLong = "";
            var nameShort = "";

            switch(treeCheckNames[positionNode]){
                case 'Logic':
                    number1 = check(inputNodeNames[0], tree, data, nodes, false)
                    number2 = check(inputNodeNames[1], tree, data, nodes, false)
                    method = getMethod(checkNodeName, nodes, data)
                    return "\nL"+checkNodeName+" = ( "+number1+' '+logicOperatorsPython(method)+' '+number2+" )"
                case 'Math':
                    var Mathstr = ""
                    number1 = check(inputNodeNames[0], tree, data, nodes, false)
                    number2 = check(inputNodeNames[1], tree, data, nodes, false)
                    method = getMethod(checkNodeName, nodes, data)
                    
                    nameLong = getName(inputNodeNames[0], nodes, data)
                    nameShort = getNamePython(nameLong)
                    var out = nameShort + inputNodeNames[0]
                    if(nameShort != 'N'){
                        Mathstr = Mathstr + number1
                        number1 = out
                    }
                    
                    nameLong = getName(inputNodeNames[1], nodes, data)
                    nameShort = getNamePython(nameLong)
                    out = nameShort + inputNodeNames[1]
                    if(nameShort != 'N'){
                        Mathstr = Mathstr + number2
                        number2 = out
                    }
                    
                    if(For == true){
                        return number1+","+number2+","+method+','
                    }else{
                        return Mathstr+"\nM"+checkNodeName+" = "+number1+' '+mathOperationsPython(method)+' '+number2
                    }
                case 'FOR':
                    var init = check(inputNodeNames[0], tree, data, nodes, true)
                    var end = check(inputNodeNames[1], tree, data, nodes, true)
                    var functionMath = check(inputNodeNames[2], tree, data, nodes, true)
                    var operations = functionMath.split(",");
                    return '\nF'+checkNodeName+" = "+operations[0]+'\nfor _ in range('+init+', '+end+')'+':'+'\n\tF'+checkNodeName+' = F'+checkNodeName+' '+mathOperationsPython(operations[2])+' '+operations[1]
                
                case 'IFELSE':
                var IEout = "\nIE"+checkNodeName+"="
                var condition = check(inputNodeNames[0], tree, data, nodes, false)
                var function1 = check(inputNodeNames[1], tree, data, nodes, false)
                var function2 = check(inputNodeNames[2], tree, data, nodes, false)
                nameLong = getName(inputNodeNames[1], nodes, data)
                nameShort = getNamePython(nameLong)
                var out1 = nameShort + inputNodeNames[1]

                if(nameShort == 'N'){
                    out1 = IEout + out1
                }else{
                    out1 = function1 + IEout + out1
                }

                nameLong = getName(inputNodeNames[2], nodes, data)
                nameShort = getNamePython(nameLong)
                var out2 = nameShort + inputNodeNames[2]
                
                if(nameShort == 'N'){
                    out2 = IEout + out2
                }else{
                    out2 = function2 + IEout + out2
                }
                
                out1 = indentCode(out1)
                out2 = indentCode(out2)

                if(For == true){
                    //var function1Parameters = function1.split(",")
                    //var function2Parameters = function2.split(",")
                }else{
                    var ifElseCode = condition+"\nif(L"+inputNodeNames[0]+"):"+out1+" \nelse:"+out2
                    return ifElseCode
                }
                break
            }
            return "Node not found"
        }

        var nodeNameRoot = nodeNames[parseInt(positionRoot)]
        let program = ""
        program = check(nodeNameRoot, this.tree, this.data, this.nodes, false);
        var numberGlobalVars = numberList.length 
        var stringGlobalVars = ""
        for(let pos = 0; pos <  numberGlobalVars; pos++){
            stringGlobalVars = stringGlobalVars + "\n" + numberList[pos]+" = "+numberListValues[pos]
        }
        var finalResult = stringGlobalVars + program
        finalResult = finalResult.replace("\n", "")
        var nameLong = getName(nodeNameRoot, this.nodes, this.data)
        var nameShort = getNamePython(nameLong)
        this.pythonCode = finalResult + '\nprint('+nameShort+nodeNameRoot+')'
    }

    getRoot(){
        var treeCheck = []
        var treeCheckNames = []
        var treeCheckNumbers = []
        var keyNode = "";
        var nodeName = ""
        var numberNodes = this.tree.length;
        var nodeNames = []

        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            nodeNames[i] = nodeName
            treeCheck[i] = false
            treeCheckNames[i] = this.getName(nodeName, this.nodes, this.data)
        }
        
        function check(checkNodeName, tree){
            var positionNode = nodeNames.indexOf(checkNodeName)
            if( positionNode == -1){
                return 1;
            }
            else{
                if(treeCheck[positionNode] == true){
                    return treeCheckNumbers[positionNode];
                }
                var keyNode = JSON.stringify(Object.keys(tree)[positionNode]).replace(/"/g, '')
                var numberInputs = Object.values(tree[keyNode])[0].length
                var numberChecks = 0
                var nameInput = ""
                for (let j = 0; j < numberInputs; j++){
                    nameInput = Object.values(tree[keyNode])[0][j]
                    numberChecks += check(nameInput, tree)
                }

                treeCheckNumbers[positionNode] = numberChecks;
                treeCheck[positionNode] = true
                return treeCheckNumbers[positionNode];
            }
        }

        for (let i = 0; i < numberNodes; i++){
            keyNode = JSON.stringify(Object.keys(this.tree)[i]).replace(/"/g, '')
            nodeName = JSON.stringify(Object.keys(this.tree[keyNode])[0]).replace(/"/g, '').replace(/'/g, '')
            check(nodeName, this.tree);
        }

        var max = 0;
        var position = -1;
        var finalPosition = 0;
        for (let number in treeCheckNumbers){
            position++;
            if(treeCheckNumbers[number] > max){
                max = treeCheckNumbers[number]
                finalPosition = position;
            }
        }
        return finalPosition
    }

    getName(nodeCode, nodes, data){
        for (let node in nodes){
            let thisNode = data[nodes[node]];
            let thisnodeName = JSON.stringify(thisNode.id)
            if (thisnodeName == nodeCode){
                return JSON.stringify(thisNode.name).replace(/"/g, '')
            }
        }
        return ''
    }

    getValue(nodeCode, nodes, data){
        for (let node in nodes){
            let thisNode = data[nodes[node]];
            let thisnodeName = JSON.stringify(thisNode.id)
            if (thisnodeName == nodeCode){
                if(JSON.stringify(thisNode.name).replace(/"/g, '') == 'Numeric'){
                    return JSON.stringify(thisNode.data.valuevar).replace(/"/g, '') 
                }
            }
        }
        console.log("this node does not have values")
        return ''
    }

    getMethod(nodeCode, nodes, data){
        for (let node in nodes){
            let thisNode = data[nodes[node]];
            let thisnodeName = JSON.stringify(thisNode.id)
            if (thisnodeName == nodeCode){
                var name = JSON.stringify(thisNode.name).replace(/"/g, '') 
                if(name == 'Math' || name == 'Logic'){
                    return JSON.stringify(thisNode.data.data.method).replace(/"/g, '') 
                }
            }
        }
        console.log("this node does not have values")
        return ''
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