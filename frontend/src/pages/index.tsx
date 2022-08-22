import { withUrqlClient } from "next-urql"
import { Layout } from "../components/Layout"
import { usePostsQuery } from "../generated/graphql"
import { createUrqlClient } from "../utils/createUrqlClient"

const Index = () => {
  const [{data}] = usePostsQuery()
  return (
    <Layout>
      <br />
      {!data ? <div>Loading just wait a sec...</div> : data.posts.map(post => <div key={post._id}>{post.title}</div>)}
    </Layout>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true}) (Index)
