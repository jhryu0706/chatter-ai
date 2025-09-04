"use server"
// adding this file because inngest sends request to different endpoints depending on whether the function call 
// is coming from client or server

import { inngest } from "./client";

export async function sendNewConversationToInngest(
    agentId:string,
    conversationId:string,
    userId:string
){
    try{
    await inngest.send({
        name: "conversation/created",
        data: {
          agentId,
          conversationId,
          userId,
        },
      });} catch(err){
        console.error(err)
      }
}

export async function sendNewAgentToInngest(
    agentId:string,
    description:string,
    voiceId:string
){
    try{
    await inngest.send({
            name:"agent/created",
            data: {
                agentId,
                description,
                voiceId
            }
        })} catch(err) {
            console.error(err)
        }
}
