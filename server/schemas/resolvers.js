const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');
const mongoose = require('mongoose')

const resolvers = {
    Query: async (parent, argsObj, context) => {
        if (context)
    }
}