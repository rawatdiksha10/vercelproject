import { useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import { Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import Table from 'react-bootstrap/Table';
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { search} from "../../services/mainService";
import { getAllEngineer, deleteEngineer } from "../../services/skillService";
import { RouterPath } from "../../util/enum/Enum";
import LabelTagField from '../form/LabelTag';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../home/home.css';

let dto = {
  iteNoOri: '',
  getAllbuttonClick: '',
  jpLevel: '',
  expOver: '',
  expUnder: '',
  certificate: '',
  language: [],
  searchKeyword: ''
};

const EngineerList = () => {

  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  //const [buttonClick, setButtonClick] = useState('');

  const { register, handleSubmit, reset, setValue,getValues, watch} = useForm({
    mode: 'all'
  });

  const location = useLocation(); 
  const saveData = location.state?.dto;

    //onload
    useEffect(() => {
      async function loadData(savedData: any) {
        if (savedData) {
          if (savedData.getAllbuttonClick === 'getall') {
            const reSave:any = await getAllEngineer(navigate);
            setData(reSave);
            console.log(reSave);
          }else if (savedData.getAllbuttonClick === 'search'){
            setValue("jpLevel", savedData.jpLevel);
            setValue("expOver", savedData.expOver);
            setValue("expUnder", savedData.expUnder);
            setValue("certificate", savedData.certificate);
            setValue("language", savedData.language);
            setValue("searchKeyword", savedData.searchKeyword);
            const reSave:any = await search(navigate, savedData);
            setData(reSave);
            console.log(reSave);
          }
        }
      }
      loadData(saveData);
      console.log(saveData);
      navigate(location.pathname, { replace: true });
      console.log("location.state?.dto", location.state?.dto);
    }, [location.pathname, location.state?.dto, navigate, saveData, setValue]);


  const onSubmit = async (data:any) => {
    dto = {
      iteNoOri: getValues('userid'),
      getAllbuttonClick: 'search',
      jpLevel: getValues('jpLevel'),
      expOver: getValues('expOver'),
      expUnder: getValues('expUnder'),
      certificate: getValues('certificate'),
      language: getValues('language'),
      searchKeyword: getValues('searchKeyword')
    };
    const resultBySearch:any = await search(navigate, data);
    setData(resultBySearch);
  }

  const getAll = async () => {
    //setButtonClick(buttonId);
    const getAll: any = await getAllEngineer(navigate);
    setData(getAll);
    reset();
    dto = {
      iteNoOri: '',
      getAllbuttonClick: 'getall',
      jpLevel: '',
      expOver: '',
      expUnder: '',
      certificate: '',
      language: [],
      searchKeyword: ''
    };
  }

  const clearData = async () => {
    setData([]);
    reset();
  }

  const handleDelete = (userId: any) => {
    setSelectedUserId(userId);
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = async (event: any) => {
    const userid = selectedUserId;
    const deleteData: any = await deleteEngineer(navigate,userid);
    setData(deleteData);
    setShowConfirmation(false);
  };  
  
  const handleNavigate = (userid:any) => {

    // const dto = {
    //   iteNoOri: userid,
    //   getAllbuttonClick: buttonClick,
    //   jpLevel: getValues('jpLevel'),
    //   expOver: getValues('expOver'),
    //   expUnder: getValues('expUnder'),
    //   certificate: getValues('certificate'),
    //   language: getValues('language'),
    //   searchKeyword: getValues('searchKeyword')
    // };
    dto.iteNoOri = userid;
    navigate(RouterPath.SkillSet, { state: { dto } });
  };
 
  return (
    <>
    <div className='main-container'>
      <div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className = 'label-container'>
            <div>
              <Form.Label className = 'label-text'>日本語レベル :</Form.Label>
              <input {...register('jpLevel')} 
                value={watch('jpLevel') || ''}
                onChange={(e) => setValue('jpLevel', e.target.value)} />
            </div>
            <div>
              <Form.Label className = 'label-text'>経験年数 :</Form.Label>
              <input maxLength={5}
                className = 'exp-textbox' {...register('expOver')} 
                value={watch('expOver') || ''}
                onChange={(e) => setValue('expOver', e.target.value)}/>
              <Form.Label className = 'label-text'>以上</Form.Label>
              <input maxLength={5}
              className = 'exp-textbox' {...register('expUnder')} 
               value={watch('expUnder') || ''}
               onChange={(e) => setValue('expUnder', e.target.value)}/>
              <Form.Label className = 'label-text'>以下</Form.Label>          
            </div>
            <div>
              <Form.Label className = 'label-text'>資格 :</Form.Label>
              <input {...register('certificate')} 
                value={watch('certificate') || ''}
                onChange={(e) => setValue('certificate', e.target.value)}/>
            </div>
          </div>
          <div>
            <Form.Label className = 'label-tag-text'>検索レベルタグ :</Form.Label>
            <LabelTagField
		            name='language'
                register={register}
	            />
            <Form.Label className = 'label-tag-text'>検索キーワード :</Form.Label>
            <input className = 'search-textbox' {...register('searchKeyword')}
               value={watch('searchKeyword') || ''}
               onChange={(e) => setValue('searchKeyword', e.target.value)}/>
          </div>
          <div className= 'flex-submit'>
            <div>
              <Button type="reset" onClick = {clearData} className="button-text">クリア</Button>
            </div>  
            <div>
              <Button type="submit" className="button-text" 
                //onClick={() => {setButtonClick('search');}}
                >検索</Button>
            </div>
            <div>
              <Button type="reset" 
                onClick={getAll} 
                className="button-text">全て検索</Button>
            </div>
          </div>
        </Form>
      </div>
      <div className="table-container">
        <Table className='engi_table'>
          <thead className = 'engi_table_head'>
            <tr>
              <th>ITE番号</th>
              <th>名前</th>
              <th>ステータス</th>
              <th>時給</th>
              <th>日本語レベル</th>
              <th>経験年数</th>
              <th>得意とする分野</th>
              <th>スキル</th>
              <th>資格</th>
              <th>アクション</th>
            </tr>
          </thead>
          {data.length === 0 ? (
            <tbody>
            <tr>
              <td style={{ textAlign: 'left' }} colSpan={10}>該当データがありません。</td>
            </tr>
          </tbody>
          ) : (
            <tbody>
            {data.map((userData, index) => {
              return (
                <tr key={index}>
                <td>{userData['userid']}</td>
                <td>{userData['name']}</td>
                <td>{userData['status_name']}</td>
                <td>{userData['hourlywages']}</td>
                <td>{userData['jppassedlevel']}</td>
                <td>{userData['totalexp']}</td>
                <td>{userData['content'] ? (userData['content'] as string[]).join(',') : ''}</td>
                <td>{userData['techskill']}</td>
                <td>{userData['certificate_name']}</td>
                <td>
                  <span className = 'icon-grp'>
                  <Button variant="link" className="icon-link" onClick={() => handleDelete(userData['userid'])}>
                    <DeleteIcon />
                  </Button>
                    <Modal show={showConfirmation} onHide={handleCancelDelete}>
                      <Modal.Header closeButton>
                        <Modal.Title>ユーザーの削除</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>ユーザー: {selectedUserId} を削除してもよろしいですか？</Modal.Body>
                      <Modal.Footer>
                      <Button id = {userData['userid']} variant="danger" onClick={handleConfirmDelete}>
                          はい
                        </Button>
                        <Button variant="secondary" onClick={handleCancelDelete}>
                          いいえ
                        </Button>
                      </Modal.Footer>
                    </Modal>
                    <Button onClick={() => handleNavigate(userData['userid'])} variant="link" className='icon-link'>
                      <EditIcon />
                    </Button>
                  </span>
                </td>
              </tr>
              );
            })}
            </tbody>
          )}
        </Table>
      </div>
    </div>
    </>
  );
};

export default EngineerList;