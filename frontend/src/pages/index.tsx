import { Box, Button, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import { useState } from "react"
import { Layout } from "../components/Layout"
import { UpvoteSection } from "../components/UpvoteSection"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string  })
  const [{data, fetching}] = usePostsQuery({
    variables,
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
          :data!.posts.posts.map(post => 
            <Flex key={post._id} p={5} shadow='md' borderWidth='1px'>
              <UpvoteSection post={post}/>
              <Box>
                <Heading fontSize='xl'>{post.title}</Heading>
                <Text mt={4}>{post.text.slice(0, 50)}...</Text>
              </Box>
            </Flex>
          )}
      </Stack>
      { data && data.posts.hasMore ? (
        <Flex>
          <Button onClick={() => {
            setVariables({
              limit: variables.limit,
              cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
            })
          }}  isLoading={fetching} m="auto" my={8}>Load more</Button>
        </Flex>)
        : null
      }
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true}) (Index)
