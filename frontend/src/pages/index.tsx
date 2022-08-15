import { NavBar } from "../components/NavBar"
import { withUrqlClient } from "next-urql"
import { createUrqlClient } from "../utils/createUrqlClient"
import { usePostsQuery } from "../generated/graphql"

const Index = () => {
  const [{data}] = usePostsQuery()
  return (
    <>
      <NavBar/>
      <br />
      {!data ? <div>Loading just wait a sec...</div> : data.posts.map(post => <div key={post._id}>{post.title}</div>)}
    </>
  )
}

export default withUrqlClient(createUrqlClient, {ssr: true}) (Index)
