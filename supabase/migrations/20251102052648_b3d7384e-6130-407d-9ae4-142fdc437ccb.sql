-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('student', 'teacher');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_number TEXT,
  roll_number TEXT,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time TIME NOT NULL DEFAULT CURRENT_TIME,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_name TEXT,
  status TEXT DEFAULT 'present',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, date)
);

-- Enable RLS on attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Students can view their own attendance"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Students can mark their own attendance"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create assignments table
CREATE TABLE public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  subject TEXT,
  comments TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Assignments policies
CREATE POLICY "Students can view their own assignments"
  ON public.assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
    )
  );

CREATE POLICY "Students can submit their own assignments"
  ON public.assignments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create study notes table
CREATE TABLE public.study_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  reminder_date TIMESTAMPTZ,
  file_url TEXT,
  file_name TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on study notes
ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

-- Study notes policies
CREATE POLICY "Students can view their own notes"
  ON public.study_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can create their own notes"
  ON public.study_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own notes"
  ON public.study_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students can delete their own notes"
  ON public.study_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignments', 'assignments', false);

-- Storage policies for assignments
CREATE POLICY "Users can upload their own assignment files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'assignments' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own assignment files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'assignments' AND 
    (
      auth.uid()::text = (storage.foldername(name))[1] OR
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() AND profiles.role = 'teacher'
      )
    )
  );

-- Create storage bucket for study notes files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('study-notes', 'study-notes', false);

-- Storage policies for study notes
CREATE POLICY "Users can upload their own study note files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'study-notes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own study note files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'study-notes' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone_number, roll_number, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    NEW.raw_user_meta_data->>'phone_number',
    NEW.raw_user_meta_data->>'roll_number',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_study_notes_updated_at
  BEFORE UPDATE ON public.study_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();