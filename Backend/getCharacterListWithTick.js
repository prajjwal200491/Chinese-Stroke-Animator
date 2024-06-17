const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {poolPromise} = require('./db');

router.get('/getCharactersWithTick', async (req, res)=>{
    try{
        console.log('inside getCharactersWithTick');
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();
    console.log('inside getCharactersWithTick transaction started');
        const listResult = await transaction
                .request()
                .query('SELECT * FROM ChineseCharacters');
        console.log(listResult);
        
        res.json(listResult.recordset);
    
}
catch(err){
    console.error(err.message);
    res.status(500).send('Internal Server Error');
}
});

module.exports = router;