import "dotenv/config";
import express from "express";
import user from '../schema/user';
import pwdreset from '../schema/passwordreset';

const router = express.Router();

router.post("/login", async (req, res) => {

    let resp = { userid:'', name:'', role:0, sessionId:'' };
    await user.findOne({
        userid: req.body.userid,
        password:req.body.password
    })
    .then(async (u:any) => {
        if (u) {
            resp = { userid:req.body.userid, name:u.name, role:u.roleflg, sessionId:req.sessionID };
            req.session.user = { userid:req.body.userid, name:u.name, roleflg:u.roleflg };
        }
    })
    await res.send(resp);
});

router.post("/checkite", async (req, res) => {
    let isITEExist = false;

    await user.findOne({
        userid: req.body.userid
    })
    .then(async (u) => {
        if (u) {
            isITEExist = true
        } 
    })    
    await res.send(isITEExist);
});

router.post("/resetpwdinit", async (req, res) => {
    let isRecordExist = false;
    let message = false;  
    await pwdreset.findOne({
        userid: req.body.userid, 
        resetflg: 0
    })
    .then(async (u) => {
        if (u) {
            isRecordExist = true
        }
    });       
    
    if(isRecordExist){
        await pwdreset.updateOne({
            userid: req.body.userid, 
            resetflg: 0 
        }, { 
            requestAt: new Date()
        }).then(s=>{
            message = true;
        }).catch((error) => {
            message = false;
        });    
    } else {
        const prst = new pwdreset();
        prst.userid = req.body.userid,
        prst.resetflg = 0;
        prst.requestAt = new Date();

        await prst.save().then(s => {
            message = true;
        }).catch((error) => {
            message = false;
            console.log(error);
        });        
    }
    await res.send(message);
});

router.get("/checkAuthorization", async (req, res) => {
    await res.send(req.session.user);
});

router.delete("/logout/:id", async (req, res) => {
    const {id} = req.params;

    await req.sessionStore.destroy(id, err => {
        if (err) {
          console.error(err);
          res.send(false);
          return;
        }    
        res.clearCookie('skill');
        res.send(true);
    });
});

router.post('/resetpwd', async (req, res) => {
    const userId = req.body.userid;
    const secondPassword = req.body.secondpassword;
    const today = new Date();
  
    await user.updateOne({ userid: userId, delflg: 0 }, { password: secondPassword, updatedAt: `${today}`});
    await pwdreset.updateOne({ userid: userId, resetflg: 0 }, { resetflg: 1, resetAt: `${today}`});
  
    res.status(200).json({
        message: 'Reset password successfully!'
    });
});

router.get('/getAllResetpwd', async (req, res) => {

    const query = pwdreset.find({ resetflg: 0});
    query.sort({ requestAt: -1 });
  
    query.exec()
        .then(async (userList: any) => {
  
            const resultArray = [];
        
            for (let i = 0; i < userList.length ; i++){
    
                let userObj = {};

                const userName = await user.findOne({userid: userList[i]['userid'],roleflg:2,delflg: 0})
                .select('name').exec();
    
                const formattedDate = new Date(userList[i]['requestAt']).toLocaleString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }).replace(',', '');
        
                userObj = {
                    'userid'   : userList[i]['userid'],
                    'username' : userName ? userName.name : null,
                    'resetreqdate' : formattedDate,
                    'key'        : i+1
                };
                resultArray.push(userObj);
            }

            res.status(200).json(resultArray);
       
        })
        .catch((error: Error) => {
            console.error(error);
        });  
});

export default router;