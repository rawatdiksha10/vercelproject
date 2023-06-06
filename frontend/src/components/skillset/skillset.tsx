import { Button, Col, Container, Form, Row, Table } from "react-bootstrap";
import { useNavigate} from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import './skillset.css';
import { BsFillPlusCircleFill } from 'react-icons/bs';
import { getAllTags, getUserProfileByITENo, saveEngineerProfile } from "../../services/skillService";
import { RouterPath } from "../../util/enum/Enum";
import { useLocation } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { dateToYMD } from "../../util/formatDate";
import "../engineer/myPage.css"

type SpecialExperiance = {
  _id:string;
  content: string;
  exptypeflg: number;
  specexp: string;
};

type TechnicalSkill = {
  _id:string;
  content: string;
  tech: string;
  roleandscale: string;
};

type Qualification = {
  _id:string;
  acqdate: string;
  source: string;
  name: string;
}

type Error = { 
  error_id: string; 
  error_message: string; 
}

type Tag = {
  lbltgid: number;
  lbltgname: string 
}

function SkillSet() {
  const navigate = useNavigate();
  const location = useLocation(); 
  const dto = location.state?.dto;

  let [_id, setId] = useState('');
  const [iteNo, setIteNo] = useState<string | undefined>(undefined);  
  const [eName, setEName] = useState(undefined);
  const [status, setStatus] = useState(1);
  const hourlywages = useRef<HTMLInputElement>(null);
  const workExperience = useRef<HTMLInputElement>(null);
  const japanCompanyWorkExperience = useRef<HTMLInputElement>(null);
  const recomondedPoints = useRef<HTMLTextAreaElement>(null);
  const technicalSkill = useRef<HTMLTextAreaElement>(null);
  const appealPoints = useRef<HTMLTextAreaElement>(null);

  const [errorMessages, setErrorMessages] = useState<Error[]>([]);
  const [labelTagList, setLabelTagList] = useState<Tag[]>([]);

  const [specExp, setSpecExp] = useState([
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' },
    { _id:'', content: '', exptypeflg: 0, specexp:'' }
  ]);

  const [langSkill, setLangSkillData] = useState({
    japanese: undefined,
    jpexamname: undefined,
    jppassedlevel:undefined,
    english: undefined,
    otherLanguageLevel: undefined,
  });

  const [ahTechnicalSkills, setAHTechnicalSkillsData] = useState([
    { _id:'', content: '', tech: '', roleandscale:'' },
    { _id:'', content: '', tech: '', roleandscale:'' },
    { _id:'', content: '', tech: '', roleandscale:'' },
    { _id:'', content: '', tech: '', roleandscale:'' },
    { _id:'', content: '', tech: '', roleandscale:'' }
  ]);

  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<Number[]>([]);

  //events
  const handleSpecExpChange = (event: any, rowIndex: number, field: keyof SpecialExperiance) => {
    const value = event.target.value;
    const updatedTableData = [...specExp];
    (updatedTableData[rowIndex] as any)[field] = field==="exptypeflg" ? parseInt(value, 10) : value;
    setSpecExp(updatedTableData);
  };

  //status change

  const handleStatusChange = (event: any) => {
    const value = event.target.value;
    console.log(value);
    setStatus(value);
  }

  const handleTechnicalSkillChange = (event: any, rowIndex: number, field: keyof TechnicalSkill) => {
    const value = event.target.value;
    const updatedTableData = [...ahTechnicalSkills];
    (updatedTableData[rowIndex] as any)[field] = value;
    setAHTechnicalSkillsData(updatedTableData);
  };

  const handleAddRow = () => {
    setQualifications([...qualifications, { _id:'', acqdate: '', source: '', name: '' }]);
  };

  const handleAddNewRowChange = (e:any, index: number) => {
    const { name, value } = e.target;
    const newRows = [...qualifications];
    (newRows[index] as any)[name as keyof Qualification] = value;
    setQualifications(newRows);
  };

  const handleAddNewRowChangeForDate = (date:any, index: number) => {

    const formattedDate = date ? dateToYMD(date) : null;
    const name = "acqdate";
    const newRows = [...qualifications];
    (newRows[index] as any)[name as keyof Qualification] = formattedDate;
    setQualifications(newRows);
    // const formattedDate = date ? date.toISOString().substring(0, 10) : null;
    // console.log(formattedDate);
    // console.log(date);
    // console.log(dateToYMD(date));
    // const name = "acqdate";
    // const newRows = [...qualifications];
    // (newRows[index] as any)[name as keyof Qualification] = dateToYMD(date);
    // setQualifications(newRows);
  };
  

  const handleCancelButtonClick = () => {
    navigate(RouterPath.EngineerList, { state: { dto } });
  }

  const handleSaveButtonClick = async () => {
    
    var profile = {
      _id: _id,
      iteNo: iteNo,
      iteNoOri:dto.iteNoOri,
      eName: eName,
      statusid: status,
      hourlywages: hourlywages.current?.value,
      recomondedPoints: recomondedPoints.current?.value,
      workExperience: workExperience.current?.value,
      japanCompanyWorkExperience: japanCompanyWorkExperience.current?.value,
      specExp: specExp,
      langSkill: langSkill,
      selectedLabels: selectedLabels,
      technicalSkill: technicalSkill.current?.value,
      ahTechnicalSkills: ahTechnicalSkills,
      appealPoints: appealPoints.current?.value,
      qualifications: qualifications
    }

    let valid:boolean = validateProfile(profile);
 
    if(valid){
      var validProfile = getValidateProfile(profile);
      var x:any = await saveEngineerProfile(navigate, validProfile);
      if(x.isSaved){
        alert("Saved successfully");
        navigate(RouterPath.EngineerList, { state: { dto } });
      } else {
        alert("Not Saved:"+x.errorMsg);
      }      
    } else {
      alert("登録データに不備があります。入力データをもう一度確認してください。");
    }
  };

  const setProfile = (userProfile:any, tags:any) => {

    //id
    setId(userProfile._id);

    //iteNo
    setIteNo(dto.iteNoOri);

    //Name
    setEName(userProfile.eName);  
    
    //Status
    setStatus(userProfile.statusid);  

    //Wages
    if(hourlywages.current) {        
      hourlywages.current.value = userProfile.hourlywages;
    }
    //setHourlyWages(userProfile.hourlywages);

    //workExperience
    if(workExperience.current) {        
      workExperience.current.value = userProfile.workExperience;
    }

    //japanCompanyWorkExperience
    if(japanCompanyWorkExperience.current) {        
      japanCompanyWorkExperience.current.value = userProfile.japanCompanyWorkExperience;
    }

    //recomondedPoints
    if(recomondedPoints.current) {        
      recomondedPoints.current.value = userProfile.recomondedPoints;
    }

    //langSkill
    setLangSkillData(prevState => ({ ...prevState, japanese: userProfile.langSkill.japanese }));
    setLangSkillData(prevState => ({ ...prevState, jpexamname: userProfile.langSkill.jpexamname }));
    setLangSkillData(prevState => ({ ...prevState, jppassedlevel: userProfile.langSkill.jppassedlevel }));
    setLangSkillData(prevState => ({ ...prevState, english: userProfile.langSkill.english }));
    setLangSkillData(prevState => ({ ...prevState, otherLanguageLevel: userProfile.langSkill.otherLanguageLevel }));

    //technicalSkill
    if(technicalSkill.current) {        
      technicalSkill.current.value = userProfile.technicalSkill;
    }

    //appealPoints
    if(appealPoints.current) {        
      appealPoints.current.value = userProfile.appealPoints;
    }

    //specExp       
    const updatedSpecExp:any = [...specExp];
    if(userProfile.specExp.length > 0){
      userProfile.specExp.forEach((se:any, index:number) => {        
        updatedSpecExp[index] = { _id:se._id, content: se.content, exptypeflg: se.exptypeflg, specexp: se.specexp }; 
      });
    }else{          
      specExp.forEach((se:any, index:number) => {    
        updatedSpecExp[index] = { _id:'', content: '', exptypeflg: 0, specexp:'' };              
      });
    }      
    setSpecExp(updatedSpecExp);

    //selectedLabels
    const updatedSelectedLabels = [...selectedLabels];
    
    var index = 0;
    tags.forEach(async (sl:any) => { 
      const lbltgidList = userProfile.selectedLabels.map((label:any) => label.lbltgid);
      const checkbox:any = document.querySelector('input[type="checkbox"][name="language"][value=\''+sl.lbltgid+'\']');

      if (lbltgidList.includes(sl.lbltgid)){
        updatedSelectedLabels[index] = sl.lbltgid; 
        index++;
        if (checkbox) {
          checkbox.checked = true;           
        }           
      }
      else{
        if (checkbox) {
          checkbox.checked = false;
        }
      }               
    });
    console.log('updatedSelectedLabels',updatedSelectedLabels);
    setSelectedLabels(updatedSelectedLabels);

    //ahTechnicalSkills
    const updatedAHTechnicalSkills = [...ahTechnicalSkills];
    if(userProfile.ahTechnicalSkills.length > 0){
      userProfile.ahTechnicalSkills.forEach((ah:any, index:number) => {        
        updatedAHTechnicalSkills[index] = { _id:ah._id, content: ah.content, tech: ah.tech, roleandscale:ah.roleandscale };        
      });
    }else{
      ahTechnicalSkills.forEach((ah:any, index:number) => {        
        updatedAHTechnicalSkills[index] = { _id:'', content: '', tech: '', roleandscale:'' };        
      });
    }        
    setAHTechnicalSkillsData(updatedAHTechnicalSkills);

    //qualification
    let updatedQualifications = [...qualifications];
    if(userProfile.qualifications.length > 0){
      userProfile.qualifications.forEach((q:any, index:number) => {        
        updatedQualifications[index] = { _id:q._id, name: q.name, acqdate: q.acqdate, source:q.source };        
      });
    }else{
      updatedQualifications = [];
    }        
    setQualifications(updatedQualifications);
  };

  //onload
  useEffect(() => {
    async function loadData(iteNoOri: any) {
      const tags = await getAllTags(navigate);
      if (tags != null) {
        setLabelTagList(tags);
        //setStatusList(status);
        const userProfile = await getUserProfileByITENo(navigate, iteNoOri);
        if (userProfile != null) {
          setProfile(userProfile, tags);
        }
      }
    }
    loadData(dto.iteNoOri);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //function
  function handleLableChange(event:any) {
    const selectedLanguage = Number(event.target.value);

    if (event.target.checked) {    
      setSelectedLabels([...selectedLabels, selectedLanguage]);
    } else {
      const removed = selectedLabels.filter(lang => lang !== selectedLanguage);
      setSelectedLabels(removed);
    }
  }

  function getValidateProfile(profile:any){
    profile.specExp = profile.specExp.filter((x:any) => (x.content !== "" && x.exptypeflg !== 0 && x.specexp !== "") 
    || (x._id !== "" && x.content === "" && x.exptypeflg === 0 && x.specexp === ""));
    profile.ahTechnicalSkills = profile.ahTechnicalSkills.filter((x:any) => (x.content !== "" && x.tech !== "" && x.roleandscale !== "")
    || (x._id !== "" && x.content === "" && x.tech === "" && x.roleandscale === ""));
    profile.qualifications = profile.qualifications.filter((x:any) => (x.name !== "" && x.source !== "" && x.acqdate !== "")
    || (x._id !== "" && x.name === "" && x.source === "" && x.acqdate === ""));
    return profile;
  }
  
  function validateProfile(profile:any) {
    let errors:Error[] = [];

    if(!profile.iteNo){
      if (!errors.some((error) => error.error_id === "er_iteNo")) {
        errors.push({ error_id: "er_iteNo", error_message: "ITE番号を入力してください。" });       
      }   
    }
        
    if(!profile.eName){
      if (!errors.some((error) => error.error_id === "er_eName")) {
        errors.push({ error_id: "er_eName", error_message: "名前を入力してください。" });
      }   
    }

    if(!profile.langSkill.japanese && !profile.langSkill.jpexamname && !profile.langSkill.jppassedlevel 
    && !profile.langSkill.english && !profile.langSkill.otherLanguageLevel){
      if (!errors.some((error) => error.error_id === "er_langSkill")) {
        errors.push({ error_id: "er_langSkill", error_message: "語学スキルを入力してください。" });
      }
    }

    //specExp[] 
    let partiallyFilledSE = profile.specExp.filter((x:any) => ((x.content !== "" && (x.exptypeflg === 0 || x.specexp === "")) 
    || (x.exptypeflg !== 0 && (x.specexp === "" || x.content === "")) 
    || (x.specexp !== "" && (x.exptypeflg === 0 || x.content === ""))));

    
    if(partiallyFilledSE.length>0){
      if (!errors.some((error) => error.error_id === "er_se")) {
        errors.push({ error_id: "er_se", error_message: "正しく入力してください。" });
      }
    }

    //AHTechnicalSkills
    let partiallyFilledAHTechnicalSkills = profile.ahTechnicalSkills.filter((x:any) => ((x.content !== "" && (x.roleandscale === "" || x.tech === "")) 
    || (x.roleandscale !== "" && (x.tech === "" || x.content === "")) 
    || (x.tech !== "" && (x.roleandscale === "" || x.content === ""))));

    if(partiallyFilledAHTechnicalSkills.length>0){
      if (!errors.some((error) => error.error_id === "er_ahts")) {
        errors.push({ error_id: "er_ahts", error_message: "正しく入力してください。" });
      }
    }   

    //Qualifications
    let partiallyFilledQualifications= profile.qualifications.filter((x:any) => ((x.acqdate !== "" && (x.source === "" || x.name === "")) 
    || (x.source !== "" && (x.name === "" || x.acqdate === "")) 
    || (x.name !== "" && (x.acqdate === "" || x.source === ""))));

    if(partiallyFilledQualifications.length>0){
      if (!errors.some((error) => error.error_id === "er_qlf")) {
        errors.push({ error_id: "er_qlf", error_message: "正しく入力してください。" });
      }
    }

    setErrorMessages(errors);
    return errors.length === 0;
  }

  function getErrorMessage(error_id:any){
    return errorMessages.find(x=>x.error_id === error_id)?.error_message;
  }

  async function handleFormControlChanged(event:any) {    
    if(event.target.id === "iteNo"){
      setIteNo(event.target.value);

      if(event.target.value){
        const filteredErrMsg = errorMessages.filter((error) => error.error_id !== "er_iteNo");
        setErrorMessages(filteredErrMsg);          
        
      }else{
        if (!errorMessages.some((error) => error.error_id === "er_iteNo")) {
          setErrorMessages([...errorMessages, { error_id: "er_iteNo", error_message: "ITE番号を入力してください。" }]);
        }
      }
    }

    if(event.target.id === "eName"){
      setEName(event.target.value);

      if(event.target.value){
        const filteredErrMsg = errorMessages.filter((error) => error.error_id !== "er_eName");
        setErrorMessages(filteredErrMsg); 
      }else{
        if (!errorMessages.some((error) => error.error_id === "er_eName")) {
          setErrorMessages([...errorMessages, { error_id: "er_eName", error_message: "名前を入力してください。" }]);
        }
      }
    }

    if(event.target.id === "japanese" || event.target.id === "jpexamname" || event.target.id === "jppassedlevel" 
    || event.target.id === "english" || event.target.id === "otherLanguageLevel"){
      const { name, value } = event.target;
      setLangSkillData(prevState => ({ ...prevState, [name]: value }));

      if(((!event.target.value && event.target.id === "japanese") && (langSkill.jpexamname === undefined || langSkill.jpexamname === "") && (langSkill.jppassedlevel === undefined || langSkill.jppassedlevel === "") && (langSkill.english === undefined || langSkill.english === "") && (langSkill.otherLanguageLevel === undefined || langSkill.otherLanguageLevel === "") )
      || ((!event.target.value && event.target.id === "jpexamname") && (langSkill.japanese === undefined || langSkill.japanese === "") && (langSkill.jppassedlevel === undefined || langSkill.jppassedlevel === "") && (langSkill.english === undefined || langSkill.english === "") && (langSkill.otherLanguageLevel === undefined || langSkill.otherLanguageLevel === "") )
      || ((!event.target.value && event.target.id === "jppassedlevel") && (langSkill.jpexamname === undefined || langSkill.jpexamname === "") && (langSkill.japanese === undefined || langSkill.japanese === "") && (langSkill.english === undefined || langSkill.english === "") && (langSkill.otherLanguageLevel === undefined || langSkill.otherLanguageLevel === "") )
      || ((!event.target.value && event.target.id === "english") && (langSkill.jpexamname === undefined || langSkill.jpexamname === "") && (langSkill.jppassedlevel === undefined || langSkill.jppassedlevel === "") && (langSkill.japanese === undefined || langSkill.japanese === "") && (langSkill.otherLanguageLevel === undefined || langSkill.otherLanguageLevel === "") )
      || ((!event.target.value && event.target.id === "otherLanguageLevel") && (langSkill.jpexamname === undefined || langSkill.jpexamname === "") && (langSkill.jppassedlevel === undefined || langSkill.jppassedlevel === "") && (langSkill.english === undefined || langSkill.english === "") && (langSkill.japanese === undefined || langSkill.japanese === "") ) ){

        if (!errorMessages.some((error) => error.error_id === "er_langSkill")) {
          setErrorMessages([...errorMessages, { error_id: "er_langSkill", error_message: "語学スキルを入力してください。" }]);
        }        

      }else{
        const filteredErrMsg = errorMessages.filter((error) => error.error_id !== "er_langSkill");
        setErrorMessages(filteredErrMsg);
      }
    }
  }

    return (
      <div>
        <Container>
          <Row style={{ marginTop: "3%" }}>
            <Col md={6}>
              <Form.Group as={Row}>
                <Form.Label column md={2}>ITE番号:<span style={{ color: 'red' }}>*</span></Form.Label>
                <Col md={10}>
                  <Form.Control id="iteNo" size="sm" type="text" value={iteNo || ''} onChange={handleFormControlChanged} />
                  { getErrorMessage('er_iteNo') ? <div style={{ color: 'red', fontSize:'small' }} >{getErrorMessage('er_iteNo')}</div> : null}  
                </Col>                            
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group as={Row}>
                <Form.Label column md={2}>名前:<span style={{ color: 'red' }}>*</span></Form.Label>
                <Col md={10}>
                  <Form.Control id="eName" size="sm" type="text" value={eName || ''} onChange={handleFormControlChanged}/>
                  { getErrorMessage('er_eName') ? <div style={{ color: 'red', fontSize:'small' }} >{getErrorMessage('er_eName')}</div> : null} 
                </Col>                      
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ marginTop: "3%" }}>
            <Col md={6}>
              <Form.Group as={Row}>
                <Form.Label column md={3}>ステータス:<span style={{ color: 'red' }}>*</span></Form.Label>
                <Col md={9}>
                  <Form.Select size="sm" value={status} onChange={(event) => handleStatusChange(event)}>
                    <option value={1}>稼働中</option>
                    <option value={2}>待機中</option>
                    <option value={3}>復社予定者</option>
                    <option value={4}>入社予定者</option>
                  </Form.Select>
                </Col>                            
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group as={Row}>
                <Form.Label column md={2}>時給:<span style={{ color: 'red' }}>*</span></Form.Label>
                <Col md={10}>
                <Form.Control id="hourlywages" size="sm" type="text" ref={hourlywages}/>
                </Col>                      
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ marginTop: "3%" }}>
            <Form.Group>
              <Form.Label>おすすめポイント:</Form.Label>
              <Form.Control size="sm" as="textarea" ref={recomondedPoints} rows={5}/>
            </Form.Group>
          </Row> 

          <Row style={{ marginTop: "3%" }}>
            <Col md="6">
              <Form.Group as={Row}>
                <Form.Label column md={2}>実務経験:</Form.Label>
                <Col md={10}>
                  <Form.Control id="workExperience" size="sm" type="text" ref={workExperience}/>
                </Col>                
              </Form.Group>
            </Col>
            <Col md="6">
              <Form.Group as={Row}>
                <Form.Label column md={4}>日本企業勤務経験:</Form.Label>
                <Col md={8}>
                  <Form.Control size="sm" type="text" ref={japanCompanyWorkExperience}/>
                </Col>                
              </Form.Group>
            </Col>
          </Row>

          <Row style={{ marginTop: "3%" }}>
            <Form.Group>
              <Form.Label>得意とする経験・分野・スキル:</Form.Label>
              <div style={{ color: 'blue', fontSize:'small' }}>
                ※一行埋めるなら全部埋めてください。
                { getErrorMessage('er_se') ? <span style={{ color: 'red', fontSize:'small', float:'right' }} >{getErrorMessage('er_se')}</span> : null} 
              </div>                                 
            </Form.Group>
            <Table bordered hover size="sm" responsive>
              <colgroup>
                <col style={{ width: '60%' }} /> 
                <col style={{ width: '20%' }} /> 
                <col style={{ width: '20%' }} /> 
              </colgroup>
              <thead>
                <tr>
                  <td><center>得意とする経験・分野・スキル</center></td>                    
                  <td><center>経験年数</center></td>
                  <td><center>経験の種類</center></td>
                </tr>
              </thead>
              <tbody>
                {specExp.map((rowData, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>
                      <Form.Control style={{ border: "none" }} size="sm" type="text" value={rowData.content} onChange={(event) => handleSpecExpChange(event, rowIndex, 'content')}/>
                    </td>
                    <td>
                      <Form.Control style={{ border: "none" }} size="sm" type="text" value={rowData.specexp} onChange={(event) => handleSpecExpChange(event, rowIndex, 'specexp')}/>
                    </td>
                    <td>
                      <Form.Select style={{ border: "none" }} size="sm" value={rowData.exptypeflg} onChange={(event) => handleSpecExpChange(event, rowIndex, 'exptypeflg')}>
                        <option value={0}>選択</option>
                        <option value={1}>アカデミック・プロジェクト</option>
                        <option value={2}>インターンシップ</option>
                        <option value={3}>実務経験</option>
                      </Form.Select>
                    </td>                      
                  </tr>
                ))}
              </tbody>
            </Table>
          </Row>

          <Row style={{ marginTop: "3%" }}>
            <Col md="8">
              <Form.Group>
                <Form.Label>語学スキル:<span style={{ color: 'red' }}>*</span></Form.Label>
                { getErrorMessage('er_langSkill') ? <span style={{ color: 'red', fontSize:'small', float:'right' }} >{getErrorMessage('er_langSkill')}</span> : null}  
              </Form.Group>
              <Table bordered hover size="sm" responsive>
                <colgroup>
                  <col style={{ width: '12%' }} /> 
                  <col style={{ width: '22%' }} /> 
                  <col style={{ width: '22%' }} /> 
                  <col style={{ width: '36%' }} /> 
                </colgroup>
                <tbody>
                  <tr>
                    <td>日本語</td>
                    <td>
                      <Form.Control
                        style={{ border: "none" }}
                        size="sm"
                        type="text"
                        placeholder="日本語レベル"
                        name="japanese"
                        id="japanese"
                        value={langSkill.japanese || ''}
                        onChange={handleFormControlChanged}
                      />
                    </td>
                    <td>
                      <Form.Control
                        style={{ border: "none" }}
                        size="sm"
                        type="text"
                        placeholder="日本語試験名"
                        name="jpexamname"
                        id="jpexamname"
                        value={langSkill.jpexamname || ''}
                        onChange={handleFormControlChanged}
                      />
                    </td>
                    <td>
                      <Form.Control
                        style={{ border: "none" }}
                        size="sm"
                        type="text"
                        placeholder="日本語試験の合格レベル"
                        name="jppassedlevel"
                        id="jppassedlevel"
                        value={langSkill.jppassedlevel || ''}
                        onChange={handleFormControlChanged}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>英語</td>
                    <td colSpan={3}>
                      <Form.Control
                        style={{ border: "none" }}
                        size="sm"
                        type="text"
                        name="english"
                        placeholder="英語レベル"
                        id="english"
                        value={langSkill.english || ''}
                        onChange={handleFormControlChanged}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>その他</td>
                    <td colSpan={3}>
                      <Form.Control
                        style={{ border: "none" }}
                        size="sm"
                        type="text"
                        placeholder="その他言語のレベル"
                        name="otherLanguageLevel"
                        id="otherLanguageLevel"
                        value={langSkill.otherLanguageLevel || ''}
                        onChange={handleFormControlChanged}
                      />
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Col>
          </Row>

          <Row style={{ marginTop: "3%" }}>                   
            <Form.Group>
              <Form.Label>検索ラベルタグ:</Form.Label>
              <div id="id_language">
                  {labelTagList?.map(labelTag => {
                    return (              
                      <label key={labelTag.lbltgid}>
                        <input type="checkbox" name="language" value={labelTag.lbltgid} 
                        onChange={handleLableChange} 
                        />
                        <span>{labelTag.lbltgname}</span>
                      </label>
                    );
                  })}
              </div>
            </Form.Group>      
          </Row>

          <Row style={{ marginTop: "3%" }}>
            <Form.Group className="mb-3">
              <Form.Label>技術スキル:</Form.Label>
              <Form.Control size="sm" as="textarea" ref={technicalSkill} rows={5}/>
            </Form.Group>
          </Row>  

          <Row style={{ marginTop: "3%" }}>
            <Form.Group>
              <Form.Label>技術スキル習得歴:</Form.Label>
              <div style={{ color: 'blue', fontSize:'small' }}>
                ※一行埋めるなら全部埋めてください。
                { getErrorMessage('er_ahts') ? <span style={{ color: 'red', fontSize:'small', float:'right' }} >{getErrorMessage('er_ahts')}</span> : null} 
              </div>
            </Form.Group>
            <Table bordered hover size="sm" responsive>
                <colgroup>
                  <col style={{ width: '55%' }} /> 
                  <col style={{ width: '25%' }} /> 
                  <col style={{ width: '20%' }} /> 
                </colgroup>
                <thead>
                  <tr>
                    <td><center>内容</center></td>
                    <td><center>使用技術（システム環境・言語等）</center></td>
                    <td><center>役割・規模</center></td>
                  </tr>
                </thead>
                <tbody>
                  {ahTechnicalSkills.map((rowData, rowIndex) => (
                    <tr key={rowIndex}>
                      <td>
                        <Form.Control style={{ border: "none" }} size="sm" type="text" value={rowData.content} onChange={(event) => handleTechnicalSkillChange(event, rowIndex, 'content')}/>
                      </td>
                      <td>
                        <Form.Control style={{ border: "none" }} size="sm" type="text" value={rowData.tech} onChange={(event) => handleTechnicalSkillChange(event, rowIndex, 'tech')}/>
                      </td>
                      <td>
                        <Form.Control style={{ border: "none" }} size="sm" type="text" value={rowData.roleandscale} onChange={(event) => handleTechnicalSkillChange(event, rowIndex, 'roleandscale')}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>             
          </Row>   
          <Row style={{ marginTop: "3%" }}>
            <Form.Group className="mb-3">
              <Form.Label>アピールポイント:</Form.Label>
              <Form.Control size="sm" as="textarea" ref={appealPoints} rows={5}/>           
            </Form.Group>
          </Row>
 
          <Row style={{ marginTop: "3%" }}>
            <Form.Group>
              <Form.Label>保有資格:&nbsp;&nbsp;</Form.Label>              
              <div style={{ color: 'blue', fontSize:'small' }}>
                ※一行埋めるなら全部埋めてください。
                { getErrorMessage('er_qlf') ? <span style={{ color: 'red', fontSize:'small', float:'right' }} >{getErrorMessage('er_qlf')}</span> : null} 
              </div>
            </Form.Group>
            <Table bordered hover size="sm" responsive>
              <colgroup>
                <col style={{ width: '35%' }} /> 
                <col style={{ width: '15%' }} /> 
                <col style={{ width: '50%' }} /> 
              </colgroup>
              <thead>
                <tr>
                  <td><center>資格名</center></td>
                  <td><center>取得日付</center></td>
                  <td><center>勉強ソース</center></td>                      
                </tr>
              </thead>
              <tbody>
                {qualifications.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <Form.Control style={{ border: "none" }} size="sm" type="text" name="name" value={row.name} onChange={(e) => handleAddNewRowChange(e, index)}/>
                    </td>
                    <td>
                      {/* <Form.Control style={{ border: "none" }} size="sm" type="date" name="acqdate" value={row.acqdate} onChange={(e) => handleAddNewRowChange(e, index)}/> */}
                      <DatePicker
                        placeholderText="yyyy/MM"
                        wrapperClassName="datePicker"
                        selected={row.acqdate == null ? null: new Date(row.acqdate)}
                        //value={row.acqdate?? ""}
                        onChange={(date) => handleAddNewRowChangeForDate(date, index)}
                        minDate={new Date("1980/01/01")}
                        maxDate={new Date("2100/01/01")}
                        dateFormat="yyyy/MM"
                        showMonthYearPicker
                      />
                    </td>
                    <td>
                      <Form.Control style={{ border: "none" }} size="sm" type="text" name="source" value={row.source} onChange={(e) => handleAddNewRowChange(e, index)}/>
                    </td>                      
                  </tr>
                  
                ))}
              </tbody>                
            </Table>                      
          </Row>
          <Row style={{ float: 'right' }}>
          <span onClick={handleAddRow} style={{ marginTop:'-33.5%', marginLeft:'-30%', cursor: 'pointer', color: 'green' }}>
              <BsFillPlusCircleFill/>
          </span>
          </Row> 
          <hr></hr>   
          <Row>
            <Col md="6">             
            </Col>
            <Col md="6">             
              <Row>
                <Col md="6"></Col>
                <Col md="6">  
                  <div style={{float:'right'}}>
                    <Button variant="secondary" type="button" onClick={handleCancelButtonClick} size="sm">Cancel</Button>
                    &nbsp;
                    <Button variant="primary" type="button" onClick={handleSaveButtonClick} size="sm">Save</Button>
                  </div>      
                </Col>
              </Row>                
            </Col>                 
          </Row>
          <br></br>  
        </Container>
      
    </div>
    );
  }
  
  export default SkillSet;