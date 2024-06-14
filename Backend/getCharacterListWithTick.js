const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {poolPromise} = require('./db');

router.get('/api/lists/getCharactersWithTick', async (req, res)=>{
    try{

    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

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