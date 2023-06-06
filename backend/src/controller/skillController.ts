/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config";
import "dotenv/config";
import express from "express";
import user from '../schema/user';
import userinfo from "../schema/userinfo";
import specexp from "../schema/specexp";
import jobhistory from "../schema/jobhistory";
import certification from "../schema/certification";
import tag from "../schema/tag";
import usertag from "../schema/usertag";
import status from '../schema/status';

const router = express.Router();

router.get("/getAllTags",checkLogin, async (req, res) => {
    let tagList:any[] = [];
    await tag.find({}, { lbltgid: 1, lbltgname: 1})
    .then((tg) => {
        tagList = tg.map((t) => ({ lbltgid: t.lbltgid, lbltgname: t.lbltgname }));
    })
    .catch((err) => {
        console.error(err);
    });
    await res.send(tagList);
});

router.post("/saveEngineerProfile", checkLogin, async (req, res) => {
  const resp = { isSaved : false, errorMsg : ""};
  try{
      //check userExist
      const isUserExist = await checkUserExist(req.body.iteNoOri);    
      if(!isUserExist){
          resp.errorMsg = "新しいITE番号です。"             
      }else{           
          //update userName
          await user.updateOne(
              { userid: req.body.iteNoOri },
              { $set: {  
                  userid : req.body.iteNo,                
                  name : req.body.eName
              }
          });
          
          //------add user info
          if(req.body._id===''){
              const uInf = new userinfo();
              uInf.userid = req.body.iteNo;
              uInf.recompoint = req.body.recomondedPoints;
              uInf.statusid = req.body.statusid;
              uInf.hourlywages = req.body.hourlywages;
              uInf.totalexp = req.body.workExperience;
              uInf.jpexp = req.body.japanCompanyWorkExperience;

              uInf.japanese = req.body.langSkill.japanese;
              uInf.jpexamname = req.body.langSkill.jpexamname;
              uInf.jppassedlevel = req.body.langSkill.jppassedlevel;
              uInf.english = req.body.langSkill.english;
              uInf.otherlanglevel = req.body.langSkill.otherLanguageLevel;    

              uInf.techskill = req.body.technicalSkill;
              uInf.appeal = req.body.appealPoints;
              uInf.delflg = 0;
              uInf.save();
          }else{
              await userinfo.updateOne(
                  { _id: req.body._id },
                  { $set: { 
                      userid : req.body.iteNo,
                      recompoint : req.body.recomondedPoints, 
                      statusid : req.body.statusid,
                      hourlywages : req.body.hourlywages,
                      totalexp : req.body.workExperience,
                      jpexp : req.body.japanCompanyWorkExperience,
                      japanese : req.body.langSkill.japanese,
                      jpexamname : req.body.langSkill.jpexamname,
                      jppassedlevel : req.body.langSkill.jppassedlevel,
                      english : req.body.langSkill.english,
                      otherlanglevel : req.body.langSkill.otherLanguageLevel,    
                      techskill : req.body.technicalSkill,
                      appeal : req.body.appealPoints
                  }});
          }        
          
          //------save spec Exp
          req.body.specExp.forEach(async (se:any) => {
              if(se._id===''){
                  const speExp = new specexp();
                  speExp.userid = req.body.iteNo;
                  speExp.content = se.content;
                  speExp.exptypeflg = se.exptypeflg;
                  speExp.specexp = se.specexp;
                  speExp.delflg = 0;
                  speExp.save();
              }else{
                  if(se.content==="" && se.exptypeflg===0 && se.specexp===""){
                      await specexp.updateOne(
                          { _id: se._id },
                          { $set: {
                              userid : req.body.iteNo, 
                              delflg : 1
                          }});
                  }else{
                      await specexp.updateOne(
                          { _id: se._id },
                          { $set: { 
                              userid : req.body.iteNo, 
                              content : se.content,
                              exptypeflg : se.exptypeflg,
                              specexp : se.specexp
                          }});
                  }                
              }
          });

          
          //selectedLabels
          await usertag.deleteMany({ userid : req.body.iteNoOri });

          req.body.selectedLabels.forEach((sl:any) => {
              const ut = new usertag();   
              ut.userid = req.body.iteNo;
              ut.lbltgid = sl;
              ut.save();
          });
          
          
          //------save job history
          req.body.ahTechnicalSkills.forEach(async (ts:any) => {
              if(ts._id===''){
                  const jh = new jobhistory();
                  jh.userid = req.body.iteNo;
                  jh.content = ts.content;
                  jh.tech = ts.tech;
                  jh.roleandscale = ts.roleandscale;
                  jh.delflg = 0;
                  jh.save();
              }else{
                  if(ts.content==="" && ts.tech==="" && ts.roleandscale===""){
                      await jobhistory.updateOne(
                          { _id: ts._id },
                          { $set: { 
                              userid : req.body.iteNo, 
                              delflg : 1
                          }});
                  }else{
                      await jobhistory.updateOne(
                          { _id: ts._id },
                          { $set: { 
                              userid : req.body.iteNo, 
                              content : ts.content,
                              tech : ts.tech,
                              roleandscale : ts.roleandscale
                          }});
                  }

              }           
          });

          //------certificates
          req.body.qualifications.forEach(async (q:any) => {
              if(q._id===''){
                  const cert = new certification();
                  cert.userid = req.body.iteNo;
                  cert.name = q.name;
                  cert.source = q.source;
                  cert.acqdate = q.acqdate;
                  cert.delflg = 0;
                  cert.save();
              }else{
                  if(q.name==="" && q.source==="" && q.acqdate===""){
                      await certification.updateOne(
                          { _id: q._id },
                          { $set: { 
                              userid : req.body.iteNo, 
                              delflg : 1
                          }});
                  }else{
                      await certification.updateOne(
                          { _id: q._id },
                          { $set: { 
                              userid : req.body.iteNo, 
                              name : q.name,
                              source : q.source,
                              acqdate : q.acqdate
                          }});
                  }                
              }            
          });
          
          resp.isSaved= true;
      }
  }catch(e){
      console.log(e)
      resp.errorMsg="Unknown error"
  }
  await res.send(resp);
});


router.post("/saveEngineerProfileByEngineer", checkLogin, async (req, res) => {
  const resp = { isSaved : false, errorMsg : ""};
  try{

      //------update user table
      if(req.body.pwd != ''){
          await user.updateOne(
              { userid: req.body.iteNo },
              { $set: {                  
                  password : req.body.pwd
              }
          }); 
      }

      //update user infos
      if(req.body._id===''){
        const uInf = new userinfo();
        uInf.userid = req.body.iteNo;
        uInf.techskill = req.body.technicalSkill;
        uInf.appeal = req.body.appealPoints;
        uInf.delflg = 0;
        uInf.save();
      }else{
        await userinfo.updateOne(
          { _id: req.body._id },  
          { $set: {              
              techskill : req.body.technicalSkill,
              appeal : req.body.appealPoints
          }}); 
      }
      
      //------certificates
      req.body.qualifications.forEach(async (q:any) => {
          if(q._id===''){
              const cert = new certification();
              cert.userid = req.body.iteNo;
              cert.name = q.name;
              cert.source = q.source;
              cert.acqdate = q.acqdate;
              cert.delflg = 0;
              cert.save();
          }else{
              if(q.name==="" && q.source==="" && q.acqdate===""){
                  await certification.updateOne(
                      { _id: q._id },
                      { $set: { 
                          delflg : 1
                      }});
              }else{
                  await certification.updateOne(
                      { _id: q._id },
                      { $set: { 
                          name : q.name,
                          source : q.source,
                          acqdate : q.acqdate
                      }});
              }                
          }            
      });
      
      resp.isSaved= true;
      
  }catch(e){
      console.log(e)
      resp.errorMsg="Unknown error"
  }
  await res.send(resp);
});


router.get("/getUserProfileByITENo/:id",checkLogin, async (req, res) => {
  const {id} = req.params;    

  const profile = {
      _id:'',
      eName:'',
      statusid: '',
      hourlywages: '',
      recomondedPoints: '',
      workExperience: '',
      japanCompanyWorkExperience: '',
      technicalSkill: "",
      appealPoints: "",
      langSkill: {
          japanese: '',
          jpexamname: '',
          jppassedlevel:'',
          english: '',
          otherLanguageLevel: ''
      },
      specExp: [],
      selectedLabels: [],
      ahTechnicalSkills: [],
      qualifications: []
  }

  //user
  const user:any = await getUserByUserId(id);
  if(user){
      profile.eName = user.name;
  }
  
  //user info
  const userInfo:any = await getUserInfoByUserId(id);
  if(userInfo){
      profile._id = userInfo._id;
      profile.statusid = userInfo.statusid  || '';
      profile.hourlywages = userInfo.hourlywages  || '';
      profile.recomondedPoints = userInfo.recompoint  || '';
      profile.workExperience = userInfo.totalexp || '';
      profile.technicalSkill = userInfo.techskill || '';
      profile.japanCompanyWorkExperience = userInfo.jpexp || ''; 
      profile.appealPoints = userInfo.appeal || ''; 

      profile.langSkill.japanese = userInfo.japanese || '';
      profile.langSkill.jpexamname = userInfo.jpexamname || '';
      profile.langSkill.jppassedlevel = userInfo.jppassedlevel || '';
      profile.langSkill.english = userInfo.english || '';
      profile.langSkill.otherLanguageLevel = userInfo.otherlanglevel || '';

  }

  //specExp
  const specExps:any = await getSpecExpsByUserId(id);
  profile.specExp = specExps;

  //selectedLabels
  const selectedLabels:any = await getSelectedLabelsByUserId(id);
  profile.selectedLabels = selectedLabels;

  //ahTechnicalSkills
  const ahTechnicalSkills:any = await getAHTechnicalSkillsByUserId(id);
  profile.ahTechnicalSkills = ahTechnicalSkills;

  //qualifications
  const qualifications:any = await getQualificationsByUserId(id);
  profile.qualifications = qualifications;

  await res.send(profile);
});

router.get("/getAllEngineer", async (req, res) => {
    try {
      const userDataArr = [];
      const users = await user.find({roleflg:2,delflg: 0}).exec();
      
      for (let i = 0; i < users.length ; i++) {

        let userData = {};
  
        const userinfos = await userinfo.findOne({userid: users[i]['userid'],delflg: 0}).exec();
        const certifications = await certification.aggregate([
          {
            $match: {
              userid: users[i]['userid'],
              delflg: 0
            }
          },
          {
            $group: {
              _id: "$userid",
              certifi_name: { $push: "$name" }
            }
          },
          {
            $project: {
              _id: 1,
              joinedValues: {
                $reduce: {
                  input: "$certifi_name",
                  initialValue: "",
                  in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", ","] }, "$$this"] }
                }
              }
  
            }
          }
        ]).exec();
        let certificationName = '';
        if (certifications.length > 0) {
          certificationName = certifications[0].joinedValues;
        }
        let status_name= "";
        if (userinfos?.statusid === 1){
          status_name = '稼働中';
        }else if (userinfos?.statusid === 2) {
          status_name = '待機中';
        }else if(userinfos?.statusid === 3) {
          status_name = '復社予定者';
        }else if(userinfos?.statusid === 4){
          status_name = '入社予定者';
        }else {
          status_name = '';
        }
        const specexps = await specexp.aggregate([
          {
            $match: {
              userid: users[i]['userid'],
              delflg: 0
            }
          },
          {
            $project: {
              _id: 1,
              combinedValue: {
                $concat: ["$content", " - ", "$specexp"]
              }
            }
          },
          {
            $group: {
              _id: "$userid",
              content: { $push: "$combinedValue" }
            }
          },
        ]).exec();
        let contentname = [];
        if (specexps.length > 0) {
          contentname = specexps[0].content;
        }
  
        userData = {
          'userid' : users[i].userid,
          'name' : users[i].name,
          'hourlywages' : userinfos?.hourlywages,
          'jppassedlevel': ((userinfos?.japanese)? userinfos?.japanese : '') +' '+((userinfos?.jppassedlevel)? userinfos?.jppassedlevel : ''),
          'totalexp': userinfos?.totalexp,
          'techskill': userinfos?.techskill,
          'certificate_name' : certificationName,
          'status_name': status_name,
          'content': contentname
        };
        userDataArr.push(userData);      
      }
      res.status(200).json(userDataArr);  
    } catch (err) {
      console.log(err);
    }
  
});

router.post("/deleteEngineer", async (req, res) => {

    try {
  
      const userId = req.body.userid;
      const update = { delflg: 1 };
  
      await user.findOneAndUpdate({ userid: userId }, update);
      await userinfo.findOneAndUpdate({ userid: userId }, update);
      await certification.findOneAndUpdate({ userid: userId }, update);
      await specexp.findOneAndUpdate({ userid: userId }, update);
  

      const userDataArr = [];
      let userData;
      const users = await user.find({roleflg: 2,delflg: 0}).exec();
      
      for (let i = 0; i < users.length ; i++) {
  
        const userinfos = await userinfo.findOne({userid: users[i]['userid']}).exec();
        const certifications = await certification.aggregate([
          {
            $match: {
              userid: users[i]['userid'],
              delflg: 0
            }
          },
          {
            $group: {
              _id: "$userid",
              certifi_name: { $push: "$name" }
            }
          },
          {
            $project: {
              _id: 1,
              joinedValues: {
                $reduce: {
                  input: "$certifi_name",
                  initialValue: "",
                  in: { $concat: ["$$value", { $cond: [{ $eq: ["$$value", ""] }, "", ","] }, "$$this"] }
                }
              }
  
            }
          }
        ]).exec();
        let certificationName = '';
        if (certifications.length > 0) {
          certificationName = certifications[0].joinedValues;
        }
        let status_name= "";
        if (userinfos?.statusid === 1){
          status_name = '稼働中';
        }else if (userinfos?.statusid === 2) {
          status_name = '待機中';
        }else if(userinfos?.statusid === 3) {
          status_name = '復社予定者';
        }else if(userinfos?.statusid === 4){
          status_name = '入社予定者';
        }else {
          status_name = '';
        }
        const specexps = await specexp.aggregate([
          {
            $match: {
              userid: users[i]['userid'],
              delflg: 0
            }
          },
          {
            $project: {
              _id: 1,
              combinedValue: {
                $concat: ["$content", " - ", "$specexp"]
              }
            }
          },
          {
            $group: {
              _id: "$userid",
              content: { $push: "$combinedValue" }
            }
          },
        ]).exec();
        let contentname = [];
        if (specexps.length > 0) {
          contentname = specexps[0].content;
        }
  
        userData = {
          'userid' : users[i].userid,
          'name' : users[i].name,
          'hourlywages' : userinfos?.hourlywages,
          'jppassedlevel': ((userinfos?.japanese)? userinfos?.japanese : '') +' '+((userinfos?.jppassedlevel)? userinfos?.jppassedlevel : ''),
          'totalexp': userinfos?.totalexp,
          'techskill': userinfos?.techskill,
          'certificate_name' : certificationName,
          'status_name': status_name,
          'content': contentname
        };
        userDataArr.push(userData);      
      }
      res.status(200).json(userDataArr);
    } catch (err) {
      console.log(err);
    }
});

function checkLogin(req:any, res:any, next:any){
    if (!req.session.user) {
        return res.status(401).send('Session expired');
    }
    next();
}

export default router;

async function getUserByUserId(id: string) {
    let result = null;
    await user.findOne({
        userid: id
    })
    .then(async (data) => {
        if (data) {
            result = data;
        } 
    });
    return result; 
}

async function getUserInfoByUserId(id: string) {
    let result = null;
    await userinfo.findOne({
        userid: id, delflg: 0
    })
    .then(async (data) => {
        if (data) {
            result = data;
        } 
    });
    return result; 
}

async function getSpecExpsByUserId(id: string) {
    let result = null;
    await specexp.find({
        userid: id, delflg: 0
    })
    .then(async (uif) => {
        if (uif) {
            result = uif;
        } 
    });
    return result; 
}

async function getSelectedLabelsByUserId(id: string): Promise<any> {
    let result = null;
    await usertag.find({
        userid: id
    })
    .then(async (uif) => {
        if (uif) {
            result = uif;
        } 
    });
    return result; 
}

async function getAHTechnicalSkillsByUserId(id: string): Promise<any> {
    let result = null;
    await jobhistory.find({
        userid: id, delflg: 0
    })
    .then(async (uif) => {
        if (uif) {
            result = uif;
        } 
    });
    return result; 
}

async function getQualificationsByUserId(id: string): Promise<any> {
    let result = null;
    await certification.find({
        userid: id, delflg: 0
    })
    .then(async (uif) => {
        if (uif) {
            result = uif;
        } 
    });
    return result; 
}

async function checkUserExist(iteNo: any) {
    let isExist = false;
    await user.findOne({
        userid: iteNo
    })
    .then(async (u) => {
        if (u) {            
            isExist = true;             
        } 
    });
    return isExist;
}

///////// diksha

router.post("/register", async (req, res)=> {
  // let message=false;
  const { userid, name, password, role} = req.body;
  console.log(role);
  console.log(name);
  console.log(password);
  console.log(userid);
  
  const userexists = await <any>user.findOne({userid: userid});

  if(userexists)
  {
    if(userexists.delflg===0)
    {
      console.log("in if");
      res.send({message: "User already registered"});
    }
    else 
    {
      console.log("in else");
      const u = new user({
        userid:userid,
        name:name,
        password:password,
        roleflg:role
      });
      u.save().then(s => {
        console.log("saved");
        console.log(u);
          res.send({message: "User registered successfully"})
      })
      .catch((error) => {
          console.log("error");
          
      });

    }
  }
  else
  {
    console.log("no id");
    const u = new user({
      userid:userid,
      name:name,
      password:password,
      roleflg:role
    });
    u.save().then(s => {
        // message = true;
        res.send({message: "User registered successfully"})
    })
    .catch((error) => {
        console.log("error");
        
    });

  }
  
});

router.get("/fetchEnggInfo", (req, res)=> {

  user.find({roleflag:1}).then((u:any)=>{
      console.log("inside fetch");
      if(u){
           res.json(u);
      } else {
          res.send({message: "No User Data Found"})
          res.status(400).json({ message: "No User Data Found"});
      }
  })
  
});

router.post("/fetchEnggInfoByID", async (req, res) => {
  const {userid} = req.body;   

  const engginfo = {
      userid:userid,
      name:'', 
      password:'',
      roleflag:'',
      recompoint: '',
      totalexp : '',
      jpexp : '',
      japanese :'',
      jpexamname:'',
      jppassedlevel: '',
      english :'',
      otherlang :'',
      techskill : '',
      appeal:'',
      hourlywage : '',
      statusid:'',
      statusname:'',
      
      specExp: [],
      techSkill: [],
      certification: []
  }

  const u = await <any>user.findOne({userid: userid})

  const ui = await <any> userinfo.findOne({userid: userid})

  if(ui)
  {
    
    if(ui.statusid){

      const statusid = ui.statusid;

      const st = await <any> status.findOne({statusid: statusid})

      engginfo.name=u.name; 
      engginfo.password=u.password;
      engginfo.roleflag=u.roleflag;
      engginfo.recompoint= ui.recompoint;
      engginfo.totalexp = ui.totalexp;
      engginfo.jpexp = ui.jpexp;
      engginfo.japanese = ui.japanese;
      engginfo.jpexamname=ui.jpexamname;
      engginfo.jppassedlevel= ui.jppassedlevel;
      engginfo.english = ui.english;
      engginfo.otherlang = ui.otherlang;
      engginfo.techskill = ui.techskill;
      engginfo.appeal=ui.appeal;
      engginfo.hourlywage = ui.hourlywages;
      engginfo.statusid=statusid;
      engginfo.statusname = st.statusname;
    }

    else
    {
      
      engginfo.name=u.name; 
      engginfo.password=u.password;
      engginfo.roleflag=u.roleflag;
      engginfo.recompoint= ui.recompoint;
      engginfo.totalexp = ui.totalexp;
      engginfo.jpexp = ui.jpexp;
      engginfo.japanese = ui.japanese;
      engginfo.jpexamname=ui.jpexamname;
      engginfo.jppassedlevel= ui.jppassedlevel;
      engginfo.english = ui.english;
      engginfo.otherlang = ui.otherlang;
      engginfo.techskill = ui.techskill;
      engginfo.appeal=ui.appeal;
      engginfo.hourlywage = ui.hourlywages;
      
    }

  }
  
  
  const specExps:any = await getSpecExpsByUserId(userid);
  engginfo.specExp = specExps;

  const techSkills:any = await getTechSkillsByUserId(userid);
  engginfo.techSkill = techSkills;

  const certifications:any = await getCertificationsByUserId(userid);
  engginfo.certification = certifications;

  await res.send(engginfo);
});

// async function getSpecExpsByUserId(userid: string) {
//   let res = null;
//   await SpecExp.find({
//       userid: userid, delflg: 0
//   })
//   .then(async (sc) => {
//       if (sc) {
//           res = sc;
//       } 
//   });
//   return res; 
// }

async function getTechSkillsByUserId(userid: string): Promise<any> {
  let res = null;
  await jobhistory.find({
      userid: userid, delflg: 0
  })
  .then(async (jh) => {
      if (jh) {
          res = jh;
      } 
  });
  return res; 
}

async function getCertificationsByUserId(userid: string): Promise<any> {
  let res = null;
  await certification.find({
      userid: userid, delflg: 0
  })
  .then(async (c) => {
      if (c) {
          res = c;
      } 
  });
  return res; 
}






///////// end