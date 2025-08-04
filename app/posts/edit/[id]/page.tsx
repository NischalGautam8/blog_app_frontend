"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

interface Post {
  id: number;
  title: string;
  content: string;
}

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (id) {
      fetchPost();
    }
  }, [id, isAuthenticated, router]);

      const fetchPost = async () => {
    try {
      const response = await api.get(`/api/posts/${id}/`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
        },
      });
      setTitle(response.data.title);
      setContent(response.data.content);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'An error occurred while fetching the post.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      router.push('/posts');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/api/posts/${id}/update/`, { title, content }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      toast.success('Your blog post has been successfully updated.');
      router.push(`/posts/${id}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'An error occurred during post update.');
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner, or a message
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Edit Post</CardTitle>
            <CardDescription>
              Modify the details of your blog post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Your amazing blog title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your blog post content here..."
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                />
              </div>
              <Button type="submit" className="w-full">
                Update Post
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
