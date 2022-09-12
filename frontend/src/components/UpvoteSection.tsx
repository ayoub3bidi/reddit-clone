import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import { PostSnippetFragment, useMeQuery, useVoteMutation } from "../generated/graphql";

interface UpvoteSectionProps {
    post: PostSnippetFragment;
}

export const UpvoteSection: React.FC<UpvoteSectionProps> = ({ post }) => {
    const [,vote] = useVoteMutation()
    const [{data}] = useMeQuery()
    if (data?.me) {
        return (
            <Flex
            direction="column"
            justifyContent="center"
            justifyItems="center"
            mr={5}>
                <IconButton
                    onClick={async () => {
                        if (post.voteStatus === 1) {
                            return;
                        }
                        await vote({
                            postId: post._id,
                            value: 1
                        }) 
                    }}
                    aria-label='Vote up'
                    icon={<TriangleUpIcon/>}
                    colorScheme={post.voteStatus === 1 ? 'green' : undefined}
                />
                    <Text ml={4}>{post.points}</Text>
                <IconButton
                    onClick={async () => {
                        if (post.voteStatus === -1) {
                            return;
                        }
                        await vote({
                            postId: post._id,
                            value: -1
                        }) 
                    }}
                    aria-label='Vote down'
                    icon={<TriangleDownIcon/>}
                    colorScheme={post.voteStatus === -1 ? 'red' : undefined}
                />
            </Flex>
        )
    }
}