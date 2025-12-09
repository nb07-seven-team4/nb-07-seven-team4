import express from "express";
import prisma from ("../prismaClient");
import {AppError} from ("../utils/errors.js");
import { BadRequestError } from ("../utils/errors.js");
const router = express.Router({ mergeParams: true });