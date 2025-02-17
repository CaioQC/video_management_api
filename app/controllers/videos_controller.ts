import Video from '#models/video'
import { createPostValidator, updateValidator } from '#validators/video'
import type { HttpContext } from '@adonisjs/core/http'

export default class VideosController {
    async index({response, request}:HttpContext){
        const queryVideos = Video.query()
        
        const { title } = request.qs()

        if(title){
            queryVideos.whereLike("title", "%" + title + "%")
        }

        const videos = await queryVideos

        return response.status(200).json(videos)
    }

    async store({response, request}:HttpContext){
        const data = request.only([
            "title",
            "description",
            "url",
            "video_category_id"
        ])

        const payload = await createPostValidator.validate(data)

        const {video_category_id, ...video_without_category} = payload

        const newVideo = await Video.create(
            video_category_id ? payload : {...video_without_category, video_category_id : 1}
        )

        await newVideo.load("category")
        return response.status(200).json(newVideo)
    }

    async show({response, params}:HttpContext){
        const videoId = params.id

        const video = await Video.findOrFail(videoId)

        if(!video){
            return response.status(404).json({ message : "Video not found" })
        }

        else{
            return response.status(200).json(video) 
        }
    }

    async update({response, request, params}:HttpContext){
        const videoId = params.id

        const videoToUpdate = await Video.findOrFail(videoId)

        const data = request.only([
            "title",
            "description",
            "url"
        ])

        const payload = await updateValidator.validate(data)

        if(!videoToUpdate){
            return response.status(404).json({ message : "Video not found" })
        }

        else{
            const updatedVideo = await videoToUpdate.merge({title : payload.title ?? videoToUpdate.title, description : payload.description ?? videoToUpdate.description, url : payload.url ?? videoToUpdate.url})

            return response.status(200).json(updatedVideo)
        }
    }

    async destroy({response, params}:HttpContext){
        const videoId = params.id

        const videoToDelete = await Video.findOrFail(videoId)
        
        if(!videoToDelete){
            return response.status(404).json({ message : "Video not found" })
        }

        else{
            await videoToDelete.delete()

            return response.status(200).json({ message : "Video successfully deleted" })
        }
    }
}