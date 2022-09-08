import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, PostsQuery, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
    post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
    const [,vote] = useVoteMutation()
    return (
        <Flex
        direction="column"
        justifyContent="center"
        justifyItems="center"
        mr={5}>
            <IconButton onClick={async () => { await vote({ postId: post._id, value: 1 }) }} aria-label='Vote up' icon={<TriangleUpIcon/>}/>
                <Text ml={4}>{post.points}</Text>
            <IconButton onClick={async () => { await vote({ postId: post._id, value: -1 }) }} aria-label='Vote down' icon={<TriangleDownIcon/>}/>
        </Flex>
    )
}