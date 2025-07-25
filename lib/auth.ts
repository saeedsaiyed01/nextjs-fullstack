import User from "@/models/Users";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password")
        }
       
        try {
            await connectToDatabase()
            const user = await User.findOne({email:credentials.email})
            if(!user){
                throw new Error("No user found with this")
            }
           const isValid = await bcrypt.compare(
                credentials.password,
                user.password

              
            )
            if(!isValid){
                throw new Error("Invalid password")
            }

            return {
                id:user._id.toString(),
                email:user.email
            }
        } catch (error) {
            console.error("Auth error :",error)
            throw error
        }
     
      }
    }),
    // ...add more providers here
  ],
  callbacks:{
    async  jwt({token,user}){
        if(user){
            token.id=user.id
        }
        return token
    },
    async  session({session,user,token}){
        if(session.user){
            session.user.id=token.id as string
            token.id=user.id
        }
        return session
    }
  },
  pages:{
    signIn:"/login",
    error:"/login"
  },
  session:{
    strategy:"jwt",
    maxAge: 30* 24 * 60
  },
  secret:process.env.NEXTAUTH_SECRET
};