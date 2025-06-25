import ClassModel from '../models/class.model';
import ParticipantModel from '../models/participant.model';
import { UserDocument } from '../models/user.model';
import { AppError } from '../utils/errors';
import { BAD_REQUEST,FORBIDDEN,UNAUTHORIZED } from '../utils/http-status';
import UserCollection from '../models/user.model';
import { ClassDocument } from '../models/class.model';

interface ClassInput {
  name: string;
  location: string;
  capacity: number;
  startAt: string;
  endAt: string;
}
interface TeacherWithClasses {
  teacher: Partial<UserDocument>;
  classes: ClassDocument[];
}

export const fetchClassesForUser = async (user: UserDocument) => {
  if (user.role === 'admin' || user.role === 'principal') {
    return await ClassModel.find();
  }
  if (user.role === 'teacher' || user.role === 'student') {
    const participantDocs = await ParticipantModel.find({ userId: user.id });
    const classIds = participantDocs.map((p) => p.classId);
    return await ClassModel.find({ _id: { $in: classIds } });
  }

  throw new Error('Not authorized to view classes');
};

export const createClass = async (input: ClassInput) => {
  const { name, location, capacity, startAt, endAt } = input;

  if (!name || !location || !capacity || !startAt || !endAt) {
    throw new AppError('All fields are required', BAD_REQUEST);
  }

  const newClass = await ClassModel.create({
    name,
    location,
    capacity,
    startAt,
    endAt,
  });

  return newClass;
};

export const fetchClassTeachers = async (user: UserDocument): Promise<TeacherWithClasses[]> => {
  let result: TeacherWithClasses[] = [];

  if (user.role === 'admin' || user.role === 'principal') {
    const teacherParticipants = await ParticipantModel.find({ role: 'teacher' });
    const teacherIds = [...new Set(teacherParticipants.map(p => p.userId.toString()))];
    const classIds = [...new Set(teacherParticipants.map(p => p.classId.toString()))];

    const teachers = await UserCollection.find({ _id: { $in: teacherIds } });
    const classes = await ClassModel.find({ _id: { $in: classIds } });

    result = teachers.map(teacher => {
      const teacherClassIds = teacherParticipants
        .filter(p => p.userId.toString() === (teacher._id as any).toString())
        .map(p => p.classId.toString());

      const assignedClasses = classes.filter(c => teacherClassIds.includes((c._id as any).toString()));

      return { teacher, classes: assignedClasses };
    });

  } else if (user.role === 'teacher') {
    const assignments = await ParticipantModel.find({ userId: user._id, role: 'teacher' });
    const classIds = assignments.map(p => p.classId.toString());

    const assignedClasses = await ClassModel.find({ _id: { $in: classIds } });

    result = [{
      teacher: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      classes: assignedClasses,
    }];

  } else if (user.role === 'student') {
    const studentParticipant = await ParticipantModel.findOne({ userId: user._id, role: 'student' });
    if (!studentParticipant) {
      throw new AppError('Student is not assigned to any class', BAD_REQUEST);
    }

    const classId = studentParticipant.classId;

    const teacherParticipants = await ParticipantModel.find({ classId, role: 'teacher' });
    const teacherIds = teacherParticipants.map(p => p.userId.toString());

    const teachers = await UserCollection.find({ _id: { $in: teacherIds } });
    const classInfo = await ClassModel.findById(classId);
    if (!classInfo) {
      throw new AppError('Class not found for student', BAD_REQUEST);
    }

    result = teachers.map(teacher => ({
      teacher,
      classes: [classInfo],
    }));

  } else {
    throw new AppError('Not authorized', FORBIDDEN);
  }

  return result;
};


export const assignTeachersToClass = async (
  user: UserDocument,
  classId: string,
  teacherIds: string[]
): Promise<string> => {
  if (!user || !['admin', 'principal'].includes(user.role)) {
    throw new AppError('Unauthorized', UNAUTHORIZED);
  }

  if (!classId || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    throw new AppError('classId and teacherIds are required', BAD_REQUEST);
  }

  const validTeachers = await UserCollection.find({
    _id: { $in: teacherIds },
    role: 'teacher',
  });

  if (validTeachers.length !== teacherIds.length) {
    throw new AppError('Some user IDs are not valid teachers', BAD_REQUEST);
  }

  const teacherAssignments = teacherIds.map(teacherId => ({
    classId,
    userId: teacherId,
    role: 'teacher',
  }));

  await ParticipantModel.insertMany(teacherAssignments);

  return 'Teachers assigned to class successfully';
};

export const getStudentsByClass = async (user: UserDocument) => {
  if (user.role !== 'admin' && user.role !== 'principal' && user.role !== 'teacher') {
    throw new AppError('Not authorized to view students', FORBIDDEN);
  }

  let studentParticipants;

  if (user.role === 'admin' || user.role === 'principal') {
    studentParticipants = await ParticipantModel.find({ role: 'student' }).select('userId classId');
  } else {
    const teacherClasses = await ParticipantModel.find({ userId: user._id, role: 'teacher' }).select('classId');
    const classIds = teacherClasses.map(tc => tc.classId);

    studentParticipants = await ParticipantModel.find({
      classId: { $in: classIds },
      role: 'student',
    }).select('userId classId');
  }

  const studentIds = [...new Set(studentParticipants.map(sp => sp.userId.toString()))];
  const students = await UserCollection.find({ _id: { $in: studentIds } });

  const studentsByClass = studentParticipants.reduce((acc, sp) => {
    const classIdStr = sp.classId.toString();
    if (!acc[classIdStr]) acc[classIdStr] = [];
    const student = students.find(s => (s._id as any).toString() === sp.userId.toString());
    if (student) acc[classIdStr].push(student);
    return acc;
  }, {} as Record<string, typeof students>);

  return studentsByClass;
};

export const assignStudentsToClass = async (
  user: UserDocument,
  classId: string,
  studentIds: string[]
) => {
  if (!user || !['admin', 'principal'].includes(user.role)) {
    throw new AppError('Unauthorized', UNAUTHORIZED);
  }

  if (!classId || !Array.isArray(studentIds) || studentIds.length === 0) {
    throw new AppError('classId and studentIds are required', BAD_REQUEST);
  }

  const validStudents = await UserCollection.find({
    _id: { $in: studentIds },
    role: 'student',
  });

  if (validStudents.length !== studentIds.length) {
    throw new AppError('Some user IDs are not students', BAD_REQUEST);
  }

  const studentAssignments = studentIds.map((studentId) => ({
    classId,
    userId: studentId,
    role: 'student',
  }));

  await ParticipantModel.insertMany(studentAssignments);

  return { message: 'Students assigned to class successfully' };
};