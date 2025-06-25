import { Request, Response } from 'express';
import { authRequest } from '../middleware/auth.middleware';
import { BAD_REQUEST, OK} from '../utils/http-status';
import { 
    fetchClassesForUser,
    createClass,fetchClassTeachers,
    assignTeachersToClass,
    getStudentsByClass,
assignStudentsToClass } from '../services/class.service';

export const getClasses = async (req: authRequest, res: Response) : Promise<void>=> {
  try {
    const user = req.user;  
    const classes = await fetchClassesForUser(user);
    res.status(OK).json({ status: 'success', data: classes });
  } catch (error: any) {
    res.status(BAD_REQUEST).json({ status: 'error', message: error.message });
  }
};

export const createClasses = async (req: Request, res: Response) : Promise<void> => {
  try {
    const newClass = await createClass(req.body);
    res.status(OK).json({ status: 'success', data: newClass });
  } catch (error: any) {
    res.status(BAD_REQUEST).json({ status: 'error', message: error.message });
  }
};

export const getClassTeachers = async (req: authRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const result = await fetchClassTeachers(user);
    res.status(200).json({ status: 'success', data: result });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};


export const assignClassTeachers = async (req: authRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { classId, teacherIds } = req.body;

    const assignedTeachers = await assignTeachersToClass(user, classId, teacherIds);
    res.status(200).json({ status: 'success', assignedTeachers });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getClassStudents = async (req: authRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const studentsByClass = await getStudentsByClass(user);
    res.status(200).json({ status: 'success', data: studentsByClass });
  } catch (error: any) {
    res.status(BAD_REQUEST).json({ status: 'error', message: error.message });
  }
};

export const assignClassStudents = async (req: authRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    const { classId, studentIds } = req.body;

    const result = await assignStudentsToClass(user, classId, studentIds);
    res.status(200).json({ status: 'success', ...result });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
