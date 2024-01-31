const express = require('express');
const auth = require('../middleware/user_jwt');

const RS = require('../models/RS');

const router = express.Router();

//desc  Create new RS task
//method POST
router.post('/', auth, async(req, res, next) => {
    try{
        const RS = await RS.create({title: req.body.title, description: req.body.description, user: req.user.id});
        if(!RS){
            return res.status(400).json({
                success: false,
                msg: 'Something went wrong'
            });
        }

            return res.status(200).json({
                success: false,
                RS: RS, 
                msg: 'Successfully created.'
            });
        
    }catch (error){
        next(error);
    }
});

//desc Fetch all RSs of finished: true
//method GET

router.get('/finished', auth, async(req, res, next)=>{
    try{
        const RS = await RS.find({user: req.user.id, finished: false});

        if(!RS){
            return res.status(400).json({success: false, msg: 'Someting error happened'});
        }

        res.status(200).json({success: true, count: RS.length, RSs: RS, msg:'Successfully fetched'})
    }catch(error){
        next(error);
    }
});


//desc Update a task 
//method PUT 

router.put('/:id', async(req, res, next)=>{
    try{
        let RS = await RS.findById(req.params.id);
        if(!RS){
            return res.status(400).json({success: false, msg: 'Task RS not exist'});
        }

        RS = await RS.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({success: true, RS: RS, msg: 'Successfully updated'});

    }catch(error){
        next(error);
    }
});


//desc Delete a task RS
//method DELETE

router.delete('/:id', async(req, res, next)=>{
    try{
        let RS = await RS.findById(req.params.id);
        if(!RS){
            return res.status(400).json({success: false, msg: 'Task RS not exist'});
        }

        RS = await RS.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true, msg: 'Successfully deleted task,'
        });
    }catch (error){
        next(error);
    }
    
});
module.exports = router;