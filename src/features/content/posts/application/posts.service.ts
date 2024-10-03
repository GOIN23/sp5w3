import { Injectable } from '@nestjs/common';

import { BlogOutputModel } from '../../blogs/models/output/blog.output.model';
import { CommentLikeT, CommentViewModelDb } from '../../comments/type/typeCommen';
import { PostRepository } from "../infrastructure/posts.repository";
import { PostSqlRepository } from '../infrastructure/posts.sql.repository';
import { PostsCreateModel } from "../models/input/create-posts.input.bodel";
import { statusCommentLike } from "../type/typePosts";


@Injectable()
export class PostsService {
    constructor(private postRepository: PostRepository, protected postSqlRepository: PostSqlRepository) { }

    async creatPosts(postsModel: PostsCreateModel, blog: BlogOutputModel) {

        const newUser: any = {
            blogId: postsModel.blogId,
            blogName: blog.name,
            content: postsModel.content,
            createdAt: new Date().toISOString(),
            shortDescription: postsModel.shortDescription,
            title: postsModel.title,
            extendedLikesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: statusCommentLike.None,
                newestLikes: []
            }


        }
        return await this.postSqlRepository.creatInDbPost(newUser)

    }

    async updatePost(id: string, postsModel: PostsCreateModel) {
        await this.postSqlRepository.updatePost(id, postsModel)
    }

    async deletePost(id: string) {
        await this.postSqlRepository.deletePost(id)
    }

    async createCommentPost(content: string, user: any, IdPost: string) {


        const newCommentPosts: CommentViewModelDb = {
            content: content,
            commentatorInfo: {
                userId: user.userId,
                userLogin: user.login,
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                dislikesCount: 0,
                likesCount: 0,
                myStatus: statusCommentLike.None,
            },
            IdPost,
        };

        type CommentWithouId = Omit<CommentLikeT, '_id'>;








        const commentsId = await this.postSqlRepository.createCommentPost(newCommentPosts);

        const likeInfoMetaData: any = {
            //@ts-ignore
            commentId: commentsId,
            createdAt: new Date().toISOString(),
            status: statusCommentLike.None,
            userID: user.userId,
            userLogin: user.login
        };


        await this.postSqlRepository.createLikeInfoMetaDataComment(likeInfoMetaData);


        return {
            id: `${commentsId}`,
            commentatorInfo: newCommentPosts.commentatorInfo,
            content: newCommentPosts.content,
            createdAt: newCommentPosts.createdAt,
            likesInfo: newCommentPosts.likesInfo,
        };
    }

    async updatePostsLikeDeslike(likeStatus: statusCommentLike, postId: string, userId: string, userLogin: string) {
        const fintLikeDislake = await this.postRepository.findLikeDislakePost(userId, postId);
        if (!fintLikeDislake) {
            const likeInfoMetaData: any = {
                postId: postId,
                createdAt: new Date().toISOString(),
                status: likeStatus,
                userID: userId,
                login: userLogin
            };

            await this.postRepository.addLikeDislikeInPosts(likeInfoMetaData);
            return;
        }

        await this.postRepository.updateLikeStatusInPosts(userId, likeStatus, postId);
    }

}