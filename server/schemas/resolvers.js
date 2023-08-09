const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const mongoose = require('mongoose')

const resolvers = {
    Query: {
        getUserById: async (_, { id }) => {
            const foundUser = await User.findById(id);
            if (!foundUser) {
                throw new Error("User not found!");
            }
            return foundUser;
        },

        getUserByUsername: async (_, { username }) => {
            const foundUser = await User.findOne({ username });
            if (!foundUser) {
                throw new Error("User not found!");
            }
            return foundUser;
        },
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user }
        },
        login: async (_, { loginInput }) => {
            const { username, email, password } = loginInput;
            const user = await User.findOne({ $or: [{ username }, { email }] });
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
        saveBook: async (_, { bookInput }, { user }) => {
            if (!user) {
                throw new Error("Authentication required!");
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $addToSet: { savedBooks: bookInput } },
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