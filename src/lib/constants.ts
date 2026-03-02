import type { Subject } from '@/types'

export const GATE_EXAM_DATE = new Date('2027-02-07') // GATE 2027 approximate date

export const SUBJECTS: Subject[] = [
  {
    id: 'engineering-math',
    name: 'Engineering Mathematics',
    shortName: 'Eng. Math',
    color: '#6366F1',
    icon: 'math',
  },
  {
    id: 'digital-logic',
    name: 'Digital Logic',
    shortName: 'Digital Logic',
    color: '#10B981',
    icon: 'cpu',
  },
  {
    id: 'computer-org',
    name: 'Computer Organization & Architecture',
    shortName: 'CO & Arch',
    color: '#F59E0B',
    icon: 'server',
  },
  {
    id: 'prog-ds',
    name: 'Programming & Data Structures',
    shortName: 'Prog & DS',
    color: '#EF4444',
    icon: 'code',
  },
  {
    id: 'algorithms',
    name: 'Algorithms',
    shortName: 'Algorithms',
    color: '#8B5CF6',
    icon: 'git-branch',
  },
  {
    id: 'theory-of-computation',
    name: 'Theory of Computation',
    shortName: 'TOC',
    color: '#EC4899',
    icon: 'zap',
  },
  {
    id: 'compiler-design',
    name: 'Compiler Design',
    shortName: 'Compiler',
    color: '#14B8A6',
    icon: 'terminal',
  },
  {
    id: 'operating-systems',
    name: 'Operating Systems',
    shortName: 'OS',
    color: '#F97316',
    icon: 'layers',
  },
  {
    id: 'databases',
    name: 'Databases',
    shortName: 'DBMS',
    color: '#06B6D4',
    icon: 'database',
  },
  {
    id: 'computer-networks',
    name: 'Computer Networks',
    shortName: 'CN',
    color: '#84CC16',
    icon: 'wifi',
  },
]