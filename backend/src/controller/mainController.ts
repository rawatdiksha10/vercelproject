/* eslint-disable @typescript-eslint/no-explicit-any */
import express from "express";
import LabelTag from '../schema/tag';
import User from '../schema/user';
import UserInfo from '../schema/userinfo';
import Certification from '../schema/certification';
import Status from '../schema/status';
import SpecExp from '../schema/specexp';
import UserTag from '../schema/usertag';

const router = express.Router();

router.get('/getLabels', async (req, res) => {

    const query = LabelTag.find();
  
    query.exec()
      .then((labelTagList: any) => {
  
        const resultArray = [];
        
        for (let i = 0; i < labelTagList.length ; i++){
  
          let labelTagListObj = {};
      
          labelTagListObj = {
            'label_tag_id'   : labelTagList[i]['lbltgid'],
            'label_tag_name' : labelTagList[i]['lbltgname'],
            'key'        : i+1
          };
          resultArray.push(labelTagListObj);
        }
        res.status(200).json(resultArray);
       
      })
      .catch((error: Error) => {
        console.error(error);
      });  

});

router.post('/search', async (req, res) => {

  try {

    const jpLevel = req.body.jpLevel.trim();
    const language = req.body.language;
    const certificate = req.body.certificate.trim();
    const expOver = req.body.expOver.trim();
    const expUnder = req.body.expUnder.trim();
    const searchKey = req.body.searchKeyword.trim();

    let userIds: any[] = [];
    let labelIds: any[] = [];
    let userIdsByKW: any[] = [];
    let responseData: any[] = [];
    let userDataList: any[] = [];

    if (language.length> 0) {
      const labelQueries = await LabelTag.find({ lbltgname: { $in: language } }, 'lbltgid');
      labelIds = labelQueries.flat().map(result => result.lbltgid);
    }

    if(searchKey){
      userIdsByKW = await searchByKeyword(searchKey);
    }

    if (jpLevel){
      const jpLevelUserResult = await UserInfo.find({
        $and: [
          {
            $or: [
              { japanese: { $regex: jpLevel ? jpLevel : "", $options: "i" } },
              { jppassedlevel: { $regex: jpLevel ? jpLevel : "", $options: "i" } }
            ]
          },
          { delflg: 0 }
        ]
      });
      
      const jpLevelUserIds = jpLevelUserResult.flat().map(result => result.userid);

        if (expOver || expUnder) {
          
          const TotalExpresult = await findUserExpWithUserIds(jpLevelUserIds,expOver,expUnder);        
          const specUserIds = TotalExpresult.flat().map((result: { userid: any; }) => result.userid);

          const specExpresult = await findSpecExpWithUserIds(jpLevelUserIds,expOver,expUnder);         
          const specExpUserIds = specExpresult.flat().map((result: { userid: any; }) => result.userid);
  
          if(certificate) {
  
            const certificateResult = await Certification.find({$and: [
              { userid: { $in: specUserIds} },
              {  name: { $regex: certificate ? certificate : "", $options: "i" } }
            ]});
  
            const certificateUserIds = certificateResult.flat().map(result => result.userid);
  
            if (language.length> 0) {

              const certificateResult = await Certification.find({$and: [
                { userid: { $in: specExpUserIds} },
                {  name: { $regex: certificate ? certificate : "", $options: "i" } }
              ]});
    
              const certificateUserIds = certificateResult.flat().map(result => result.userid);
  
              const UserTagResult = await UserTag.find({$and: [
                {userid: { $in: certificateUserIds } },
                { lbltgid: { $in: labelIds } }
              ]});
  
              const userTagUserIds = UserTagResult.flat().map(result => result.userid);

              if (searchKey) {
                const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
                userDataList = await getUserDataWithSpecExp(filteredUserIds);
                responseData = userDataList;
              } else {
                userDataList = await getUserDataWithSpecExp (userTagUserIds);
                responseData = userDataList;
              }
              
            }else if (searchKey) {
              const filteredUserIds = certificateUserIds.filter((userId: any) => userIdsByKW.includes(userId));
              userDataList = await getUserDataWithTotalExp(filteredUserIds);
              responseData = userDataList;
            } else {
              responseData = await getUserDataWithTotalExp(certificateUserIds);
            }
            
          } else if (language.length> 0) {
  
            const UserTagResult = await UserTag.find({$and: [
              {userid: { $in: specExpUserIds } },
              { lbltgid: { $in: labelIds } }
            ]});
  
            const userTagUserIds = UserTagResult.flat().map(result => result.userid);
            if (searchKey) {
              const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
              userDataList = await getUserDataWithSpecExp(filteredUserIds);
              responseData = userDataList;
            } else {
              userDataList = await getUserDataWithSpecExp (userTagUserIds);
              responseData = userDataList;
            }  
          } else if (searchKey) {
              const filteredUserIds = specExpUserIds.filter((userId: any) => userIdsByKW.includes(userId));
              userDataList = await getUserDataWithTotalExp(filteredUserIds);
              responseData = userDataList;
          } else {
            userDataList = await getUserDataWithTotalExp (specUserIds);
            responseData = userDataList;
          }
        } else if (certificate) {
  
          const certificateResult = await Certification.find({$and: [
            { userid: { $in: jpLevelUserIds} },
            { name: { $regex: certificate ? certificate : "", $options: "i" } }
          ]});
  
          const certificateUserIds = certificateResult.flat().map(result => result.userid);
  
          if (language.length> 0) {
  
            const UserTagResult = await UserTag.find({$and: [
              {userid: { $in: certificateUserIds } },
              { lbltgid: { $in: labelIds } }
            ]});
  
            const userTagUserIds = UserTagResult.flat().map(result => result.userid);
            if (searchKey) {
              const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
              userDataList = await getUserDataWithTotalExp(filteredUserIds);
              responseData = userDataList;
            }else {
              userDataList = await getUserDataWithTotalExp(userTagUserIds);
              responseData = userDataList;
            }
          } else if (searchKey) {
  
              const filteredUserIds = certificateUserIds.filter((userId:any) => userIdsByKW.includes(userId));
              userDataList = await getUserDataWithTotalExp(filteredUserIds);
              responseData = userDataList;
          } else {
            userDataList = await getUserDataWithTotalExp (certificateUserIds);
            responseData = userDataList;
          }
        } else if (language.length> 0) {
          const UserTagResult = await UserTag.find({$and: [
            {userid: { $in: jpLevelUserIds } },
            { lbltgid: { $in: labelIds } }
          ]});

          const userTagUserIds = UserTagResult.flat().map(result => result.userid);
          if (searchKey) {
            const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
            userDataList = await getUserDataWithTotalExp(filteredUserIds);
            responseData = userDataList;
          } else {
            userDataList = await getUserDataWithTotalExp (userTagUserIds);
            responseData = userDataList;
          }
        }else if (searchKey) {
            const filteredUserIds = jpLevelUserIds.filter((userId) => userIdsByKW.includes(userId));
            userDataList = await getUserDataWithTotalExp(filteredUserIds);
            responseData = userDataList;
        } else {
          userDataList = await getUserDataWithTotalExp (jpLevelUserIds);
          responseData = userDataList;

        }
    } else if (expOver || expUnder) {

      const UserExpresult = await findUserExp(expOver,expUnder);
      const expUserIds = UserExpresult.flat().map((result: { userid: any; }) => result.userid);

      const specExpUser = await findSpecExp(expOver,expUnder);
      const specExpUserIds = specExpUser.flat().map((result: { userid: any; }) => result.userid);

      if(certificate) {

        const certificateResult = await Certification.find({$and: [
          { userid: { $in: expUserIds} },
          {  name: { $regex: certificate ? certificate : "", $options: "i" } }
        ]});

        const certificateUserIds = certificateResult.flat().map(result => result.userid);

        if (language.length> 0) {

          const certificateResult = await Certification.find({$and: [
            { userid: { $in: specExpUserIds} },
            {  name: { $regex: certificate ? certificate : "", $options: "i" } }
          ]});
  
          const certificateUserIds = certificateResult.flat().map(result => result.userid);

          const UserTagResult = await UserTag.find({$and: [
            {userid: { $in: certificateUserIds } },
            { lbltgid: { $in: labelIds } }
          ]});

          const userTagUserIds = UserTagResult.flat().map(result => result.userid);

          if (searchKey) {
            const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
            userDataList = await getUserDataWithSpecExp(filteredUserIds);
            responseData = userDataList;
          } else {
            userDataList = await getUserDataWithSpecExp(userTagUserIds);
            responseData = userDataList;
          }
        } else if (searchKey) {
            const filteredUserIds = certificateUserIds.filter((userId) => userIdsByKW.includes(userId));
            userDataList = await getUserDataWithSpecExp(filteredUserIds);
            responseData = userDataList;
        } else{
          userDataList = await getUserDataWithTotalExp (certificateUserIds);
          responseData = userDataList;
        }  
      } else if (language.length> 0) {

        const UserTagResult = await UserTag.find({$and: [
          {userid: { $in: specExpUserIds } },
          { lbltgid: { $in: labelIds } }
        ]});

        const userTagUserIds = UserTagResult.flat().map(result => result.userid);

        if (searchKey) {
          const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
          userDataList = await getUserDataWithTotalExp(filteredUserIds);
          responseData = userDataList;
        } else {
          userDataList = await getUserDataWithSpecExp (userTagUserIds);
          responseData = userDataList;
        }
      } else if (searchKey) {
          const filteredUserIds = expUserIds.filter((userId: any) => userIdsByKW.includes(userId));
          userDataList = await getUserDataWithTotalExp(filteredUserIds);
          responseData = userDataList;
      } else{
        userDataList = await getUserDataWithTotalExp(expUserIds);
        responseData = userDataList;
      }
    }else if (certificate){

      const certificateResult = await Certification.find({
        $and: [
          { name: { $regex: certificate ? certificate : "", $options: "i" } },
          { delflg: 0 }
        ]
      });

      const certificateUserIds = certificateResult.flat().map(result => result.userid);

      if (language.length> 0) {

        const UserTagResult = await UserTag.find({$and: [
          {userid: { $in: certificateUserIds } },
          { lbltgid: { $in: labelIds } }
        ]});

        const userTagUserIds = UserTagResult.flat().map(result => result.userid);
        if (searchKey) {
          const filteredUserIds = userTagUserIds.filter((userId) => userIdsByKW.includes(userId));
          userDataList = await getUserDataWithTotalExp(filteredUserIds);
          responseData = userDataList;
        } else {
          userDataList = await getUserDataWithTotalExp(userTagUserIds);
          responseData = userDataList;
        }   
      }else if (searchKey){
        const filteredUserIds = certificateUserIds.filter((userId) => userIdsByKW.includes(userId));
        userDataList = await getUserDataWithTotalExp(filteredUserIds);
        responseData = userDataList;
      } else {
        userDataList = await getUserDataWithTotalExp(certificateUserIds);
        responseData = userDataList;
      }
    } else if (language.length> 0) {

      const userQueries = await UserTag.find({ lbltgid: { $in: labelIds } });
      userIds = userQueries.flat().map(result => result.userid);
      if (searchKey) {
        const filteredUserIds = userIds.filter((userId) => userIdsByKW.includes(userId));
        userDataList = await getUserDataWithTotalExp(filteredUserIds);
        responseData = userDataList;
      } else {
        userDataList = await getUserDataWithTotalExp(userIds);
        responseData = userDataList;
      }
    } else if (searchKey) {
      userDataList = await getUserDataWithTotalExp(userIdsByKW);
      responseData = userDataList;
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

async function searchByKeyword(searchKeyword: any): Promise<any> {
  try {
    const searchKey = searchKeyword;
    const responseData: any[] = [];

    const results = await Promise.all([
      UserInfo.aggregate([
        {
          $match: {
            $and: [
              {
                $or: [
                  { userid: { $regex: searchKey ? searchKey : "", $options: "i" } },
                  { totalexp: { $regex: searchKey, $options: "i" } },
                  { japanese: { $regex: searchKey ? searchKey : "", $options: "i" } },
                  { jppassedlevel: { $regex: searchKey ? searchKey : "", $options: "i" } },
                  { hourlywages: { $regex: searchKey, $options: "i" } },
                  { techskill: { $regex: searchKey, $options: "i" } }
                ]
              },
              { delflg: 0 }
            ]
          }
        },
        {
          $group: {
            _id: "userid",
            userIds: { $push: "$userid" }
          }
        }
      ]),      
      User.aggregate([
        { $match: {$and: [
          {
            $or: [
              { userid: { $regex: searchKey ? searchKey : "", $options: "i" } },
              {name: { $regex: searchKey? searchKey : "", $options: "i" } }
            ]
          },
          {roleflg: 2}, {delflg: 0}] }},
        { $group: {
            _id: "$name",
            userIds: { $push: "$userid" }
          }
        }
      ]),
      Status.find({ statusname: { $regex: searchKey? searchKey : "", $options: "i" } }),
      Certification.aggregate([
        { $match: {$and: [{name: { $regex: searchKey? searchKey : "", $options: "i" } }, {delflg: 0}] }},
        { $group: {
            _id: "$name",
            userIds: { $push: "$userid" }
          }
        }
      ]), 
      SpecExp.aggregate([
        { $match: {$and: [{content: { $regex: searchKey? searchKey : "", $options: "i" } }, {delflg: 0}] }},
        { $group: {
            _id: "$content",
            userIds: { $push: "$userid" }
          }
        }
      ]), 
    ]);

    if (Array.isArray(results[0]) && results[0].length > 0) {

      const userInfoData = results[0];
      userInfoData.forEach((userInfo) => {
        userInfo.userIds.forEach((userId: string) => {
          if (!responseData.includes(userId)) {
            responseData.push(userId);
          }
        });
      });
    }

    if (Array.isArray(results[1]) && results[1].length > 0) {

      const userInfoData = results[1];

      userInfoData.forEach((userInfo) => {
        userInfo.userIds.forEach((userId: string) => {
          if (!responseData.includes(userId)) {
            responseData.push(userId);
          }
        });
      });
    }

    if(Array.isArray(results[2]) && results[2].length > 0) {

      const statusData = results[2].map(({ statusname, statusid }) => ({ statusname, statusid }));
      
      for (let i = 0; i < statusData.length ; i++) {
        const userinfos = await UserInfo.find({statusid: statusData[i]['statusid']});

        for (const userInfos of userinfos) {

          responseData.push(userInfos.userid);  
        }
      } 
    } 

   if (Array.isArray(results[3]) && results[3].length > 0) {
      const certificateData = results[3];
      certificateData.forEach((certificate) => {
        certificate.userIds.forEach((userId: string) => {
          if (!responseData.includes(userId)) {
            responseData.push(userId);
          }
        });
      });
    }

    if (Array.isArray(results[4]) && results[4].length > 0) {
      const specExpData = results[4];
      specExpData.forEach((specExp) => {
        specExp.userIds.forEach((userId: string) => {
          if (!responseData.includes(userId)) {
            responseData.push(userId);
          }
        });
      });
    }

    return responseData;

  }catch (err) {
    console.log(err);
  }
}

async function getUserDataWithSpecExp(userIDs: any): Promise<any> {
 
  try {
    const resultArr: any[] = [];

    for (let i = 0; i < userIDs.length; i++) {
      let userObj = {};
      let isUserExist = false;
      const userName = await getUserName(userIDs[i]);
      const userInfo = await UserInfo.findOne({userid: userIDs[i],delflg: 0}).exec();
      const certificateName = await getCertificateName(userIDs[i]);
      const specExp = await SpecExp.findOne({userid: userIDs[i]}).exec();
      const statusName = await getStatusName(userInfo?.statusid);
      const content = await getContent(userIDs[i]);

      if(userName && !(resultArr.some(item => item.userid === userIDs[i]))) {
        isUserExist = true;
      }

      if(isUserExist){


        userObj = {
          'userid' : userIDs[i],
          'name' : userName,
          'hourlywages' : userInfo?.hourlywages,
          'jppassedlevel': ((userInfo?.japanese)? userInfo?.japanese : '') +' '+((userInfo?.jppassedlevel)? userInfo?.jppassedlevel : ''),
          'totalexp': specExp?.specexp,
          'techskill': userInfo?.techskill,
          'certificate_name' : certificateName,
          'status_name': statusName,
          'content': content
        };
        resultArr.push(userObj); 
      }

    }
    return resultArr;
  } catch (error) {
    console.error(error);
  }
}

async function getUserDataWithTotalExp(userIDs: any): Promise<any> {
 
  try {
    const resultArr: any[] = [];

    for (let i = 0; i < userIDs.length; i++) {
      let userObj = {};
      let isUserExist = false;
      const userName = await getUserName(userIDs[i]);
      const userInfo = await UserInfo.findOne({userid: userIDs[i],delflg: 0}).exec();
      const certificateName = await getCertificateName(userIDs[i]);
      const statusName = await getStatusName(userInfo?.statusid);
      const content = await getContent(userIDs[i]);

      if(userName && !(resultArr.some(item => item.userid === userIDs[i]))) {
        isUserExist = true;
      }

      if(isUserExist){
        userObj = {
          'userid' : userIDs[i],
          'name' : userName,
          'hourlywages' : userInfo?.hourlywages,
          'jppassedlevel': ((userInfo?.japanese)? userInfo?.japanese : '') +' '+((userInfo?.jppassedlevel)? userInfo?.jppassedlevel : ''),
          'totalexp': userInfo?.totalexp,
          'techskill': userInfo?.techskill,
          'certificate_name' : certificateName,
          'status_name': statusName,
          'content': content
        };
        resultArr.push(userObj); 
      } 
    }
    return resultArr;
    
  } catch (error) {
    console.error(error);
  }
}

async function getCertificateName(userid: any): Promise<any> {
  try {
    const result = await Certification.aggregate([
      {
        $match: {
          userid: userid,
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
    if (result.length > 0) {
      return result[0].joinedValues;
    } 
  } catch (error) {
    console.error(error);
  }
}


async function getContent(userid: any): Promise<any> {
 
  try {
    const result = await SpecExp.aggregate([
    {
      $match: {
        userid: userid,
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
  if (result.length > 0) {
    return result[0].content;
  }
  } catch (error) {
    console.error(error);
  }
}

async function getStatusName(statusid: any): Promise<any> {
 
  try {
    const result = await Status.findOne({statusid: statusid}).select('statusname').exec();
    return result?.statusname;
  } catch (error) {
    console.error(error);
  }
}

async function getUserName(userid: any): Promise<any> {
 
  try {
    const result = await User.findOne({userid: userid,roleflg:2,delflg: 0}).select('name').exec();
    return result?.name;
  } catch (error) {
    console.error(error);
  }
}

async function findUserExp(expOver: any, expUnder: any): Promise<any> {
  try {

    const expOverNum: number = expOver ? Number(expOver) * 12 : 0;
    const expUnderNum: number = expUnder ? Number(expUnder) * 12 : 0;

    const result = await UserInfo.find({ delflg: 0 }).select('userid totalexp');

    const filteredResult = result.filter((user: any) => {

      if (user.totalexp) {
        const matches = user.totalexp.match(/(?:(\d+)年)?(?:(\d+)月)?/);
        if (matches && matches.length > 0) {
          const years = Number(matches[1] || "0");
          const months = Number(matches[2] || "0");
          const totalMonths = years * 12 + months;
      
          if (expOver && expUnder) {
            return totalMonths >= expOverNum && totalMonths <= expUnderNum;
          }
          if (expOver && !expUnder) {
            return totalMonths >= expOverNum;
          }
          if (!expOver && expUnder) {
            return totalMonths <= expUnderNum;
          }
        }
      }      
      return false;
    });
    return filteredResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function findUserExpWithUserIds(userIds: any, expOver:any, expUnder:any): Promise<any> {

  try {

    const expOverNum: number = expOver ? Number(expOver) * 12 : 0;
    const expUnderNum: number = expUnder ? Number(expUnder) * 12 : 0;

    const result = await UserInfo.find({ userid: { $in: userIds },delflg: 0 }).select('userid totalexp');

    const filteredResult = result.filter((user: any) => {

      if (user.totalexp) {
        const matches = user.totalexp.match(/(?:(\d+)年)?(?:(\d+)月)?/);
        if (matches && matches.length > 0) {
          const years = Number(matches[1] || "0");
          const months = Number(matches[2] || "0");
          const totalMonths = years * 12 + months;
      
          if (expOver && expUnder) {
            return totalMonths >= expOverNum && totalMonths <= expUnderNum;
          }
          if (expOver && !expUnder) {
            return totalMonths >= expOverNum;
          }
          if (!expOver && expUnder) {
            return totalMonths <= expUnderNum;
          }
        }
      }
      
      return false;
    });

    return filteredResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function findSpecExp(expOver:any, expUnder:any): Promise<any> {
  try {

    const expOverNum: number = expOver ? Number(expOver) * 12 : 0;
    const expUnderNum: number = expUnder ? Number(expUnder) * 12 : 0;

    const result = await SpecExp.find({ delflg: 0 }).select('userid specexp');

    const filteredResult = result.filter((user: any) => {

      if (user.specexp) {
        const matches = user.specexp.match(/(?:(\d+)年)?(?:(\d+)月)?/);
        if (matches && matches.length > 0) {
          const years = Number(matches[1] || "0");
          const months = Number(matches[2] || "0");
          const totalMonths = years * 12 + months;
      
          if (expOver && expUnder) {
            return totalMonths >= expOverNum && totalMonths <= expUnderNum;
          }
          if (expOver && !expUnder) {
            return totalMonths >= expOverNum;
          }
          if (!expOver && expUnder) {
            return totalMonths <= expUnderNum;
          }
        }
      }
      
      return false;
    });

    return filteredResult;
  } catch (error) {
    console.error(error);
    throw error;
  }

}

async function findSpecExpWithUserIds(userIds: any, expOver:any, expUnder:any): Promise<any> {
  try {

    const expOverNum: number = expOver ? Number(expOver) * 12 : 0;
    const expUnderNum: number = expUnder ? Number(expUnder) * 12 : 0;

    const result = await SpecExp.find({userid: { $in: userIds }, delflg: 0 }).select('userid specexp');

    const filteredResult:any = result.filter((user: any) => {

      if (user.specexp) {
        const matches = user.specexp.match(/(?:(\d+)年)?(?:(\d+)月)?/);
        if (matches && matches.length > 0) {
          const years = Number(matches[1] || "0");
          const months = Number(matches[2] || "0");
          const totalMonths = years * 12 + months;
      
          if (expOver && expUnder) {
            return totalMonths >= expOverNum && totalMonths <= expUnderNum;
          }
          if (expOver && !expUnder) {
            return totalMonths >= expOverNum;
          }
          if (!expOver && expUnder) {
            return totalMonths <= expUnderNum;
          }
        }
      }
      
      return false;
    });

    return filteredResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
 
}


export default router;