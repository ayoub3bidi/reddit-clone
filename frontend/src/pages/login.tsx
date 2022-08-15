import {Formik, Form} from 'formik'
import { Button } from '@chakra-ui/react'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { toErrorMap } from '../utlis/toErrorMap'
import { useRouter } from 'next/router'
import { useLoginMutation } from '../generated/graphql'
import { withUrqlClient } from 'next-urql'
import { createUrqlClient } from '../utlis/createUrqlClient'

const Login: React.FC<{}> = ({}) => {
    const router = useRouter()
    const [, login] = useLoginMutation()
    return (
        <Wrapper variant="small">            
            <Formik 
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login(values)
                    if (response.data?.login.errors) {
                        setErrors (toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        router.push("/")
                    }
                }}
                >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='usernameOrEmail' label='Username or Email' placeholder='Username or Email'/>
                        <InputField name='password' label='Password' placeholder='Password' type='password'/>
                        <Button type='submit' isLoading={isSubmitting} bg='orange'>Login</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient) (Login)