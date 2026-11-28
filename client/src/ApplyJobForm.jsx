import { useForm } from 'react-hook-form';
import { Send, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { useApplicationStore } from '../store/useApplicationStore';

export default function ApplyJobForm({ jobId, onSuccess }) {
  const { submitApplication, loading } = useApplicationStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      cvUrl: '',
      coverLetter: '',
      cvFile: null,
    },
  });

  const onSubmit = async (values) => {
    const file = values.cvFile?.[0] || null;
    if (!file && !values.cvUrl?.trim()) {
      toast.error('Vui lòng nhập link CV hoặc chọn file CV');
      return;
    }

    const ok = await submitApplication({
      jobId,
      cvUrl: values.cvUrl,
      cvFile: file,
      coverLetter: values.coverLetter,
    });

    if (ok) {
      reset();
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border rounded-lg p-4 space-y-3 bg-white">
      <h3 className="font-semibold flex items-center gap-2">
        <FileUp size={18} /> Nộp hồ sơ ứng tuyển
      </h3>

      <div>
        <label className="block text-sm font-medium mb-1">Link CV (Google Drive / Portfolio)</label>
        <input
          type="url"
          placeholder="https://..."
          {...register('cvUrl')}
          className="w-full border rounded px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Hoặc tải file CV (PDF, DOC, DOCX)</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          {...register('cvFile')}
          className="w-full text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Thư giới thiệu</label>
        <textarea
          rows={3}
          placeholder="Giới thiệu ngắn gọn về kinh nghiệm, lịch rảnh..."
          {...register('coverLetter', {
            maxLength: { value: 1000, message: 'Tối đa 1000 ký tự' },
          })}
          className="w-full border rounded px-3 py-2 text-sm"
        />
        {errors.coverLetter && (
          <p className="text-xs text-red-600 mt-1">{errors.coverLetter.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 rounded bg-black text-white text-sm disabled:opacity-50"
      >
        <Send size={15} /> {loading ? 'Đang gửi...' : 'Gửi hồ sơ'}
      </button>
    </form>
  );
}