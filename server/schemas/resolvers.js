const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const mongoose = require('mongoose')

const resolvers = {
    Query: {
        me: async (parent, { id }, context) => {
            console.log(context.user)
            const user = await User.findOne({ id: context.user._id }).populate('savedBooks')
            return user;
        }
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new Error("User not found!");
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new Error("Invalid password!");
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, args, context) => {
            console.log(context.user)
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: args } },
                { new: true, runValidators: true }
            );
            return updatedUser;
        },
        removeBook: async (_, { bookId }, { user }) => {
            if (!user) {
                throw new Error("Authentication required!");
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            if (!updatedUser) {
                throw new Error("User not found!");
            }

            return updatedUser;
        },
    }
}

module.exports = resolvers