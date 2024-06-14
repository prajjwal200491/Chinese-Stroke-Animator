const express = require('express');
const router = express.Router();
const sql = require('mssql');
const {poolPromise} = require('./db');

router.post('/api/lists/addCharactersWithTick', async (req, res)=>{
    try{

    console.log(req);
    debugger;

    const chineseCharacters = req.body;
    if(!Array.isArray(chineseCharacters)){
        return res.status(400).json({error: 'Invalid input'});
    }

    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    try{
        if(chineseCharacters.length===0){
            res.status(201).json({ message: 'Character list with Tick information added successfully' });
        }
        else{
            const result = await transaction
                            .request()
                            .query('SELECT * FROM ChineseCharacters');
            for(const item of chineseCharacters){
                const match = result.recordset.find(r=> r.character===item.character);
                if(match){
                    await transaction
                    .request()
                    .input('character', sql.NVarChar(100), item.character)
                    .input('isTicked', sql.Bit, item.isTicked)
                    .query(`UPDATE ChineseCharacters SET isTicked=@isTicked WHERE character=@character`);
                }
                else{
                    await transaction
                    .request()
                    .input('character', sql.NVarChar(100), item.character)
                    .input('isTicked', sql.Bit, item.isTicked)
                    .query('INSERT INTO ChineseCharacters (character, isTicked) VALUES (@character, @isTicked)');
                }
                
            }
            
            await transaction.commit();
    
          res.status(201).json({ message: 'Character list with Tick information added successfully' });
        }
        
    }
    catch(error){
        await transaction.rollback();
        throw error;
    }
}
catch(err){
    console.error(err.message);
    res.status(500).send('Internal Server Error');
}
});

module.exports = router;