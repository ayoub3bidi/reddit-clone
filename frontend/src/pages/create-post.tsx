import { Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const createPost: React.FC<{}> = ({}) => {
    const router = useRouter()
    useIsAuth()
    const [, createPost] = useCreatePostMutation()
    
    return (
        <Layout variant="small">            
            <Formik
                initialValues={{ title: "", text: "" }}
                onSubmit={async (values) => {
                    const {error } =  await createPost({ input: values })
                    if (!error) { 
                        router.push("/")
                    }
                }}
                >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField name='title' label='Title' placeholder='Title'/>
                        <InputField textArea name='text' label='Text' placeholder='Text'/>
                        <Button mr={5} type='submit' isLoading={isSubmitting} bg="#FF4500">Create Post</Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
}

export default withUrqlClient(createUrqlClient) (createPost)