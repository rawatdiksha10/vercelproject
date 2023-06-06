import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useForm} from "react-hook-form";
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import Table from 'react-bootstrap/Table';
import { useState, useEffect } from 'react';
import { getResetPasswordRequest,resetPassword } from "../../services/accoutService";
import { useNavigate } from "react-router-dom";
import PasswordInputField from '../form/PasswordInputField2';
import './passwordReset.css';
function PasswordReset() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const [isButtonClicked, setIsButtonClicked] = useState(false);

  useEffect(() => {
    async function getAllResetPassword() {
      const data:any = await getResetPasswordRequest(navigate);
      setData(data);
    }
    getAllResetPassword();
  }, [navigate]);

  const alertClicked = (event: any) => {
    const linkId = event.target.id;
    setValue("userid", linkId);
    setIsButtonClicked(true);
  };

  const handleButtonClick = () => {

    clearErrors("firstpassword");
    clearErrors("secondpassword");    
    setValue("firstpassword", 'human');
    setValue("secondpassword", 'human');

  };

  const formSchema = Yup.object().shape({
    firstpassword: Yup.string()
      .min(5, "パスワードを5文字以上8文字以内で入力してください。")
      .max(8, "パスワードを5文字以上8文字以内で入力してください。"),
    secondpassword: Yup.string()
      .oneOf([Yup.ref("firstpassword")], "パスワードが一致しません。")
  });

  const { register, formState: { errors },handleSubmit, setValue, clearErrors, reset } = useForm({
    mode: 'all',
    resolver: yupResolver(formSchema),
    defaultValues: {
      userid: "",
      username: "",
      firstpassword: "",
      secondpassword: ""
    }
  });

  const onSubmit = async (data:any) => {

    setIsButtonClicked(false);
    const res:any = await resetPassword(navigate, data);

    if(res.message==="Reset password successfully!"){
      const data:any = await getResetPasswordRequest(navigate);
      setData(data);
    }
    reset({
      userid: "",
      username: "",
      firstpassword: "",
      secondpassword: ""
    });
  }

  return (
    <>
    <div className = "flex-container">

      <div className = "flex-child left">

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>No</th>
              <th>ITE番号</th>
              <th>名前</th>
              <th>依頼された日</th>
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
            {data.map((user, index) => {
              return (
                <tr key={index}>
                <td>{user['key']}</td>
                <td>
                    <Nav.Link id = {user['userid']} 
                      onClick = {alertClicked} 
                      style={{ textDecoration: 'underline', display: 'flex', justifyContent: 'center', cursor: 'pointer',
                      color: 'blue' }}>
                        {user['userid']}
                    </Nav.Link>
                </td>
                <td>{user['username']}</td>
                <td>{user['resetreqdate']}</td>
              </tr>
              );
            })}
            </tbody>
          )}
      </Table>
      </div>
      <div className = "flex-child right">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>ユーザーID:</Form.Label>
            <Form.Control type="text"
              {...register("userid")}
              disabled
            />
          </Form.Group>
          <PasswordInputField
		        name="firstpassword"
            label="新しいパスワード:"
            register={register}
            registerOptions={{ required: "Required" }}
            error={errors.firstpassword}
            disabled={!isButtonClicked}
	        />
          <p>{!errors.firstpassword ? 
            <span>※半角英数字記号5~8文字</span> : <span></span>
            }</p>
          <Form.Group className="mb-3">
            <Button variant="secondary" onClick = {handleButtonClick} disabled={!isButtonClicked}>
              初期パスワード</Button>
          </Form.Group>
          <PasswordInputField
		        name="secondpassword"
            label="再入力パスワード:"
            register={register}
            registerOptions={{ required: "Required" }}
            error={errors.secondpassword}
            disabled={!isButtonClicked}
	        />
          <Button type="submit" variant="primary" disabled={!isButtonClicked}>登録</Button>
        </Form>
      </div>
    </div>
    </>
  );
}

export default PasswordReset;