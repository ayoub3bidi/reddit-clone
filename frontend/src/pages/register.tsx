import {Formik, Form} from 'formik'
import { Button, FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react'
import { Wrapper } from '../components/Wrapper'
import { InputField } from '../components/InputField'
import { useMutation } from 'urql'

interface registerProps {}

const REGISTER_MUTATION = `
    mutation Register ($username: String!, $password: String! ){
        register(userData:{
        username: $username,
        password: $password
        }) {
        errors {
            field
            message
        }
        user {
            _id
            createdAt
            updatedAt
            username
        }
        }
    }
`

const Register: React.FC<registerProps> = ({}) => {
    const [,register] = useMutation(REGISTER_MUTATION)
    return (
        <Wrapper variant="small">            
            <Formik 
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values) => {
                    const response = await register(values)
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

export default Register