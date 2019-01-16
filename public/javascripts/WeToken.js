
function init() {
    $(document).ready(function(){});
    $("#kill").hide();
    $("#withdrawWT").hide();
    $("#withdrawButton").hide();

    web3 = new Web3();
    web3.setProvider(new web3.providers.HttpProvider("HTTP://127.0.0.1:8545")); // RPC 연결
    contractAddress = '0x6aaa2b72ae8ae74507bcd7fed3a20afc75285d97';
    contract = new web3.eth.Contract(WeTokenABI, contractAddress);
    methods = contract.methods;

    methods.startTime().call().then(l => {
        document.getElementById('salesStart').innerText = (new Date(l * 1000))
    });
    methods.deadline().call().then(l => {
        document.getElementById('deadline').innerText = (new Date(l * 1000))
    });
    methods.salesStatus().call().then(l => {
        document.getElementById('totalSaleVolume').innerText = l
    });
    methods.balanceWT().call().then(l => {
        document.getElementById('balanceWT').innerText = l
    });
    document.getElementById('contractAddress').innerText = contractAddress;
    web3.eth.getBalance(contractAddress).then(l => {
        document.getElementById('toEther').innerText = web3.utils.fromWei(l, "ether")
    });
};

function balanceOf() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와 주세요");
        return;
    }
    methods.balanceOf(myAccount).call().then(l => {
        document.getElementById('myBalance').innerText = l
    });
}



function balanceOfETH() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와 주세요");
        return;
    }
    web3.eth.getBalance(myAccount).then(l => {
        document.getElementById('myBalanceETH').innerText = web3.utils.fromWei(l)
    });
}




function balanceOfWT() {
    methods.salesStatus().call().then(l => {
        document.getElementById('totalSaleVolume').innerText = l
    });
    web3.eth.getBalance(contractAddress).then(l => {
        document.getElementById('toEther').innerText = web3.utils.fromWei(l, "ether")
    });
    methods.balanceWT().call().then(l => {
        document.getElementById('balanceWT').innerText = l
    });
}

function transfer() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와 주세요");
        return;
    }
    var toAddress = document.getElementById("toAccount").value;
    var amount = document.getElementById("amount").value;
    /* var myGas = 100000; */
    var myGas = 100000;

    
        
        if(confirm("Sender : " + myAccount +
            "\nReceiver : " + toAddress +
            "\nAmount :" + amount +
            "\nGas :" + myGas) == true) {
            Trx = contract.methods.transfer(toAddress, amount).send({
                from: myAccount,
                gas: myGas,
                gasPrice: 3
            });
            Trx.then(l => {
                r = l;
                alert("blockHash : " + r.blockHash + "\n blockNumber : " + r.blockNumber + "\n cumulativeGasUsed : " +
                    r.cumulativeGasUsed + "\n from : " + r.from + "\n gasUsed : " + r.gasUsed + "\n root : " + r.root + "\n to : " +
                    r.to + "\n transactionHash : " + r.transactionHash)
            });
        }
        else {
            alert("트랜잭션이 취소 되었습니다.")
        }
    
}

function CreateWallet() {
    password = document.getElementById('password').value;
    if (!password) {
        alert("give me your password");
        return;

    }
    a = Promise.resolve(web3.eth.accounts.create(web3.utils.randomHex(32)));
    a.then(function (pk) {
        address = pk.address;
        keyStore = JSON.stringify(web3.eth.accounts.encrypt(pk.privateKey, password));
        console.log(keyStore);
        var myKey = document.createElement("a");
        var file = new Blob([keyStore], {
            type: 'text/plain'
        });
        myKey.href = URL.createObjectURL(file);
        myKey.download = address + '.json';
        myKey.click();
    })
}

function historyViewer() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와주세요.");
        return;
    }
    document.getElementById("historyTable").innerText = " ";

    var table = document.getElementById("historyTable");

    document.getElementById("historyTable").innerText = "Loding...";
    mySendEvent = Promise.resolve(contract.getPastEvents('Transfer', {
        filter: {
            _from: myAccount
        },
        fromBlock: 0,
        toBlock: 'latest'
    }));
    mySendEvent.then(function (c) {
        l = c;
        myGetEvent = Promise.resolve(contract.getPastEvents('Transfer', {
            filter: {
                _to: myAccount
            },
            fromBlock: 0,
            toBlock: 'latest'
        }));
        myGetEvent.then(function (r) {
            result = l.concat(r);
            document.getElementById("historyTable").innerText = " ";
            var row = table.insertRow(-1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            var cell7 = row.insertCell(6);
            cell7.innerHTML = "구분";
            cell1.innerHTML = "Time";
            cell2.innerHTML = "Sender's account address";
            cell3.innerHTML = "Receiver's account address";
            cell4.innerHTML = "We Token amount";
            cell5.innerHTML = "Block number";
            cell6.innerHTML = "Transaction hash value";
            for (i = 0; i < result.length; i++) {

                log = result[i].returnValues
                var colBlock = result[i].blockNumber;
                var colTrx = result[i].transactionHash;
                var colTime = new Date(log._time * 1000);
                if (log._from == myAccount) {
                    var colEtc = '출금';
                } else if (log._to == myAccount) {
                    var colEtc = '입금';
                }
                var colFrom = log._from;
                var colTo = log._to;
                var colValue = log._value;

                var row = table.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                var cell4 = row.insertCell(3);
                var cell5 = row.insertCell(4);
                var cell6 = row.insertCell(5);
                var cell7 = row.insertCell(6);

                cell1.innerHTML = colTime;

                cell2.innerHTML = colFrom;
                cell3.innerHTML = colTo;

                cell4.innerHTML = colValue;
                cell5.innerHTML = colBlock;
                cell6.innerHTML = colTrx;
                cell7.innerHTML = colEtc;
            }
        });
    })
}

function myWallet() {
    var files = document.getElementById('wallet').files;
    if (files.length <= 0) {
        alert("give me your Keystore file")
        return false;
    }
    if (!document.getElementById("password").value) {
        alert("give me your password")
        return false;
    }
    var fr = new FileReader();

    fr.onload = function (e) {
	try {
        	JSON.parse(e.target.result);
    	}	
    	catch {
        	alert("지원하지 않는 keystore 파일입니다!")
    	}	
        var result = JSON.parse(e.target.result);
        var keyjson = JSON.stringify(result, null, 2);
	try {
        	a = web3.eth.accounts.wallet.decrypt([keyjson], document.getElementById('password').value);
	}
	catch {
		alert("password가 틀렸습니다!")
		document.getElementById("password").value = "";
	}
	 a = web3.eth.accounts.wallet.decrypt([keyjson],document.getElementById('password').value);

        myAccount = (a[0]["address"]);
        web3.eth.defaultAccount = myAccount;
        balanceOf();
        document.getElementById("password").value = "";
        alert("Keystore를 불러왔습니다.")
        document.getElementById("myAccount").innerText = myAccount;
        owner = contract.methods.owner().call().then(l => { 
	    c = l;
            if (myAccount == c) {
                alert("wellcome Master!");
                $("header").css({"background":"url('../images/background_admin.jpg')"});
                $("#append").append("<br />", "관리자 모드");
		$("#kill").show();
		$("#withdrawWT").show();
		$("#withdrawButton").show();
            }     
	});
    }
    fr.readAsText(files.item(0));
}

function buyToken() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와 주세요");
        return;
    }
    var amountWT = document.getElementById("amountWT").value;
    if(confirm("WeToken " + amountWT + " 개 만큼 구매하시겠습니까?") == true) {
        deadline = contract.methods.deadline().call().then(l => {
            c = l;
            now = + new Date();
            dead = + new Date(c * 1000);
            if (dead > now){
                userbalance = web3.eth.getBalance(myAccount);
                userbalance.then(function (l) {
                    c = l;
                    if(c >= amountWT * (10 ** 17)){
                        balanceWT = contract.methods.balanceWT().call().then(function (l) {
                            d = l;
                            if(d >= amountWT) {
                                var amount = amountWT * (10 ** 17);
                                Trx = web3.eth.sendTransaction({
                                    from:myAccount, 
                                    to:contractAddress, 
                                    value: amount,
                                    gas: 100000, 
                                    gasPrice: 18000000000 
                                });
                                Trx.then(l => {
                                    alert("WeToken " + amountWT + " 개 구입이 완료되었습니다!" );
                                    });
                            }
                            else{
                                alert("재고가 부족합니다!");
                            }
                        });
                    }
                    else {
                        alert("잔고가 부족합니다!");
                    }
                })
            }
            else {
                alert("ICO 시간이 종료되었습니다!")
            }
	});
    }
}

function refunds() {
    if (web3.eth.accounts.wallet.length < 1) {
        alert("Keystore파일이 없습니다. Keystore파일을 불러와 주세요");
        return;
    }
    if(confirm("WeToken을 환불하시겠습니까?") == true) {
        check =  contract.methods.balanceOf(myAccount).call().then(l => {
            if(l > 0) {
                Trx = contract.methods.refunds().send({
                    from: myAccount,
                    gasPrice: 18000000000,
                    gas: 1000000
                });
                Trx.then(l => {
                    r = l;
                    alert("환불이 완료되었습니다.")
                });
            }
            else {
                alert("환불할 WeToken이 없습니다.");
            }
        });
    }
}

function killcontract() {
    if(confirm("정말 contract를 없애시겠습니까?")== true) {
        Trx = contract.methods.killcontract().send({
            from: myAccount,
            gasPrice: 18000000000,
            gas: 1000000
        });
        Trx.then(l => {
            r = l;
            alert("contract를 없앴습니다!")
        });
    }
}

function withdraw() {
    var withdrawWT = document.getElementById("withdrawWT").value;
    if(confirm("WeToken " + withdrawWT +  "(" + withdrawWT / 10 + ") 만큼 인출 하시겠습니까?") == true) {

	Trx = contract.methods.withdraw(withdrawWT).send({
	    from: myAccount,
	    gasPrice: 18000000000,
            gas: 1000000
	});
	Trx.then(l => {
	    r = l;
	    alert("WeToken 인출을 완료했습니다!");
	});
    }
}

