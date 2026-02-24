import { getColor } from '../lib/constants';

export default function CoursePills({ courses, filter, onFilter }) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-2.5 flex gap-1.5 flex-wrap">
            {courses.map(c => {
                const active = c === filter;
                const col = c !== 'All' ? getColor(c) : null;
                return (
                    <button key={c} onClick={() => onFilter(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer hover:shadow-sm
              ${c === 'All'
                                ? (active ? 'bg-slate-700 text-white border-slate-700 shadow-sm' : 'bg-white text-slate-600 border-slate-300')
                                : (active ? col.pillOn + ' shadow-sm' : 'bg-white ' + col.pill)
                            }`}>
                        {c}
                    </button>
                );
            })}
        </div>
    );
}
