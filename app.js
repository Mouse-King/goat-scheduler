const express = require("express");
const cron = require("node-cron");
const axios = require("axios");
const Imap = require('imap')
const HtmlTableToJson = require('html-table-to-json')

let imapConfig = {
    user: "eqreporting@adquadrant.com",
    password: "nketuymzdihxfdfg",
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false }
}

const checkGmailBox = () => {
    let imap = new Imap(imapConfig)
    let oldTableJson = []
    
    imap.once('ready', () => {
        imap.openBox('[Gmail]/All Mail', false, async function (err, mailBox) {
            if (err) {
                console.error(err)
                return
            }
            imap.search(
                ['ALL', ['FROM', 'goat-scheduler@everquote.com'], ['HEADER', "SUBJECT", `GOAT Scheduled Report "SubID ttrs2 Hourly"`]],
                function (err, results) {
                    //Get Last Second Gmail Data
                    const lastSecondEmailIndex = results[results.length - 2];
                    var oldf = imap.fetch([lastSecondEmailIndex], { bodies: '' })
                    oldf.on('message', (msg, seqno) => {
                        msg.on('body', function (stream) {
                            let buff = ''
                            stream.on('data', function (chunk) {
                                buff += chunk.toString('utf8')
                            })
                            stream.on('end', function () {
                                const regexStart = "<table border=";
                                const regexEnd = "</table>";
    
                                const startIndex = buff.search(regexStart);
                                const endIndex = buff.search(regexEnd);
    
                                const tableContents = buff.slice(startIndex, endIndex + "</table>".length);
                                const jsonTables = HtmlTableToJson.parse(`${tableContents}`);

                                console.log("gmailbox", jsonTables.results[0].length, jsonTables.results[0])
                                for(let i = 0; i < jsonTables.results[0].length; i++)
                                {
                                    if (Number(jsonTables.results[0][i].arriva) == 0)
                                        console.log("result", i, jsonTables.results[0][i])
                                }
    
                                oldTableJson = jsonTables.results[0].filter((data) => Number(data.arriva) === 0);
                                console.log("oldTableJson", oldTableJson)
                            })
                        })
                    })
                    console.log("gmail1 oldTableJosn", oldTableJson)
                    oldf.once('error', function (err) {
                        return Promise.reject(err)
                    })
                    oldf.once('end', function () {
                        imap.end()
                    })
                    //Get New Gmail Data
                    const lastEmailIndex = results[results.length - 1];
                    var f = imap.fetch([lastEmailIndex], { bodies: '' })
                    f.on('message', (msg, seqno) => {
                        msg.on('body', function (stream) {
                            let buff = ''
                            stream.on('data', function (chunk) {
                                buff += chunk.toString('utf8')
                            })
                            stream.on('end', function async () {
                                const regexStart = "<table border=";
                                const regexEnd = "</table>";
    
                                const startIndex = buff.search(regexStart);
                                const endIndex = buff.search(regexEnd);
    
                                const tableContents = buff.slice(startIndex, endIndex + "</table>".length);
                                const jsonTables = HtmlTableToJson.parse(`${tableContents}`);
                                let newTableJson = jsonTables.results[0];

                                for (let i = 0 ; i < oldTableJson.length; i ++) 
                                    for (let j = 0; j < newTableJson.length; j ++) 
                                        if (oldTableJson[i].uri_s1 === newTableJson[j].uri_s1)
                                            console.log("gmail1 newTableJson result", newTableJson[j])


                                for (let i = 0 ; i < oldTableJson.length; i ++) {
                                    for (let j = 0; j < newTableJson.length; j ++) {
                                        if (oldTableJson[i].uri_s1 === newTableJson[j].uri_s1 && Number(newTableJson[j].arriva) > 0) {
                                            console.log("gmail1 newtablejson", newTableJson[j])
                                            axios.get('https://fluxtrk.com/tracking/conversions/postback.php', {
                                                params: {
                                                    flux_payout: newTableJson[j].arriva,
                                                    flux_txid: newTableJson[j].uri_s1,
                                                    flux_hid: newTableJson[j].uri_s1
                                                }
                                            }).then(function (response) {
                                                console.log("Data1: ", newTableJson[j]);
                                                console.log("Result: ", response.statusText);
                                            }).catch(function (error) {
                                                console.log(error);
                                            })
                                        }
                                    }
                                }
                            })
                        })
                    })
                    f.once('error', function (err) {
                        return Promise.reject(err)
                    })
                    f.once('end', function () {
                        imap.end()
                    })
                }
            )
        })
    })
    imap.once('error', function (err) {
        console.log('⨉ Cannot fetch gmails!', err)
    })
    imap.connect()
}

const checkGmailBox1 = () => {
    let imap = new Imap(imapConfig)
    let oldTableJson = []
    
    imap.once('ready', () => {
        imap.openBox('[Gmail]/All Mail', false, async function (err, mailBox) {
            if (err) {
                console.error(err)
                return
            }
            imap.search(
                ['ALL', ['FROM', 'goat-scheduler@everquote.com'], ['HEADER', "SUBJECT", `GOAT Scheduled Report "FBH`]],
                function (err, results) {
                    //Get Last Second Gmail Data
                    const lastSecondEmailIndex = results[results.length - 2];
                    var oldf = imap.fetch([lastSecondEmailIndex], { bodies: '' })
                    oldf.on('message', (msg, seqno) => {
                        msg.on('body', function (stream) {
                            let buff = ''
                            stream.on('data', function (chunk) {
                                buff += chunk.toString('utf8')
                            })
                            stream.on('end', function () {
                                const regexStart = "<table border=";
                                const regexEnd = "</table>";
    
                                const startIndex = buff.search(regexStart);
                                const endIndex = buff.search(regexEnd);
    
                                const tableContents = buff.slice(startIndex, endIndex + "</table>".length);
                                const jsonTables = HtmlTableToJson.parse(`${tableContents}`);
                                for(let i = 0; i > jsonTables.results[0].length; i++)
                                {
                                    if (Number(jsonTables.results[i].arriva) == 0)
                                        console.log("result", i, jsonTables.results[i])
                                }
                                oldTableJson = jsonTables.results[0].filter((data) => Number(data.arriva) == 0);
                            })
                        })
                    })

                    oldf.once('error', function (err) {
                        return Promise.reject(err)
                    })
                    oldf.once('end', function () {
                        imap.end()
                    })
                    //Get New Gmail Data
                    const lastEmailIndex = results[results.length - 1];
                    var f = imap.fetch([lastEmailIndex], { bodies: '' })
                    f.on('message', (msg, seqno) => {
                        msg.on('body', function (stream) {
                            let buff = ''
                            stream.on('data', function (chunk) {
                                buff += chunk.toString('utf8')
                            })
                            stream.on('end', function async () {
                                const regexStart = "<table border=";
                                const regexEnd = "</table>";
    
                                const startIndex = buff.search(regexStart);
                                const endIndex = buff.search(regexEnd);
    
                                const tableContents = buff.slice(startIndex, endIndex + "</table>".length);
                                const jsonTables = HtmlTableToJson.parse(`${tableContents}`);
                                let newTableJson = jsonTables.results[0];
                                for (let i = 0 ; i < oldTableJson.length; i ++) {
                                    for (let j = 0; j < newTableJson.length; j ++) {
                                        if (oldTableJson[i].uri_param_subid2 === newTableJson[j].uri_param_subid2 && Number(newTableJson[j].arriva) > 0) {
                                            axios.get('https://fluxtrk.com/tracking/conversions/postback.php', {
                                                params: {
                                                    flux_payout: newTableJson[j].arriva,
                                                    flux_txid: newTableJson[j].uri_param_subid2,
                                                    flux_hid: newTableJson[j].uri_param_subid2
                                                }
                                            }).then(function (response) {
                                                console.log("Data2: ", newTableJson[j]);
                                                console.log("Result: ", response.statusText);
                                            }).catch(function (error) {
                                                console.log(error);
                                            })
                                        }
                                    }
                                }
                            })
                        })
                    })
                    f.once('error', function (err) {
                        return Promise.reject(err)
                    })
                    f.once('end', function () {
                        imap.end()
                    })
                }
            )
        })
    })
    imap.once('error', function (err) {
        console.log('⨉ Cannot fetch gmails!')
    })
    imap.connect()
}
console.log('================ Running Every 1 Hour ================')
console.log("For ==========> GOAT Scheduled Report 'SubID ttrs2 Hourly'");
checkGmailBox()
console.log("For ==========> GOAT Scheduled Report 'FBH & FBH2: Hourly'");
checkGmailBox1()

cron.schedule('0 */1 * * * *', () => {
    console.log('================ Running Every 1 Hour ================')
    console.log("For ==========> GOAT Scheduled Report 'SubID ttrs2 Hourly'");
    checkGmailBox()
    console.log("For ==========> GOAT Scheduled Report 'FBH & FBH2: Hourly'");
    checkGmailBox1()
})
