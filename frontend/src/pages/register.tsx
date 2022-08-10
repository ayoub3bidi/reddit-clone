import {Formik, Form} from 'formik'
import { Button } from '@chakra-ui/react'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utlis/toErrorMap'
import { useRouter } from 'next/router'
import { createUrqlClient } from '../utlis/createUrqlClient'
import { withUrqlClient } from 'next-urql'

interface registerProps {}


const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter()
    const [, register] = useRegisterMutation()
    return (
        <Wrapper variant="small">            
            <Formik 
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, {setErrors}) => {
                    const response = await register(values)
                    if (response.data?.register.errors) {
                        setErrors (toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push("/")
                    }
                }}
                >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='username' label='Username' placeholder='Username'/>
                        <InputField name='password' label='Password' placeholder='Password' type='password'/>
                        <Button type='submit' isLoading={isSubmitting} bg='orange'>Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    )
}

export default withUrqlClient(createUrqlClient) (Register)