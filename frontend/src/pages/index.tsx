import { Box, Button, Flex, Heading, IconButton, Link, Spinner, Stack, Text } from "@chakra-ui/react"
import { withUrqlClient } from "next-urql"
import { useState } from "react"
import { Layout } from "../components/Layout"
import { UpvoteSection } from "../components/UpvoteSection"
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"
import NextLink from "next/link";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons"

const Index = () => {
  const [variables, setVariables] = useState({limit: 10, cursor: null as null | string  })
  const [{data, fetching}] = usePostsQuery({
    variables,
  })
  const [,deletePost] = useDeletePostMutation()

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
          :data!.posts.posts.map(post => !post ? null : (
              <Flex key={post._id} p={5} shadow='md' borderWidth='1px'>
                <UpvoteSection post={post}/>
                <Box flex={1}>
                  <NextLink href="/post/[id]" as={`/post/${post._id}`}>
                    <Link style={{ textDecoration: 'none' }}>
                      <Heading fontSize='xl'>{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Flex align="center">
                    <Text flex={1} mt={4}>{post.text.slice(0, 50)}...</Text>
                    <Box ml="auto">
                      <NextLink
                        href='/post/edit/[id]'
                        as={`/post/edit/${post._id}`}
                      >
                        <IconButton
                          as={Link}
                          mr={4}
                          aria-label='Edit Post'
                          icon={<EditIcon />}
                        />
                      </NextLink>
                      <IconButton
                        aria-label='Delete Post'
                        icon={<DeleteIcon />}
                        onClick={() => {
                          deletePost({ id: post._id })
                        }}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
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
