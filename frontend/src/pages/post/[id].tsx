import { Box, Heading } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { Layout } from "../../components/Layout";
import { usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = ({}) => {
  const router = useRouter()
  const intId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1
  const [{ data, error, fetching }] = usePostQuery({
    pause: intId === -1,
    variables: {
        postId: intId,
    }
  })

  if (fetching) {
    return (
        <Layout>Loading...</Layout>
    )
  }

  if (error) {
    return (<Layout><Box>{error.message}</Box></Layout>)
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      <Box>{data.post.text}</Box>
    </Layout>
  )
};

export default withUrqlClient(createUrqlClient, {ssr: true}) (Post)