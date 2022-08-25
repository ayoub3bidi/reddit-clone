import { Box, Button, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import { Layout } from "../components/Layout"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
  const [{data, fetching}] = usePostsQuery({
    variables: {
      limit: 10
    }
  })

  if (!fetching && !data) { 
    return <div>You got Query fail for some reason</div>
  }

  return (
    <Layout>
      <Stack spacing={8}>
        {!data && fetching ? 
          <div>
            <Spinner mr={2} />
            <span>Loading just wait a sec...</span>
          </div>
          :data!.posts.map(post => 
            <Box key={post._id} p={5} shadow='md' borderWidth='1px'>
              <Heading fontSize='xl'>{post.title}</Heading>
              <Text mt={4}>{post.text.slice(0, 50)}...</Text>
            </Box>
          )}
      </Stack>
      { data ? (
        <Flex>
          <Button isLoading={fetching} m="auto" my={8}>Load more</Button>
        </Flex>)
        : null
      }
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true}) (Index)
