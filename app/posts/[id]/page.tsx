"use client";

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
}

export default function PostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await api.get(`/api/posts/${id}/`);
      setPost(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.detail || 'An error occurred while fetching the post.');
      } else {
        toast.error('An unexpected error occurred.');
      }
      router.push('/posts');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}/delete/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt_token')}`,
          },
        });
        toast.success('The post has been successfully deleted.');
        router.push('/posts');
      } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response) {
          toast.error(error.response.data.detail || 'An error occurred during deletion.');
        } else {
          toast.error('An unexpected error occurred during deletion.');
        }
      }
    }
  };

  if (!post) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-8 text-center">Loading post...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{post.title}</CardTitle>
            <CardDescription>By {post.author} on {new Date(post.created_at).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
            {isAuthenticated && (
              <div className="mt-6 flex space-x-4">
                <Link href={`/posts/edit/${post.id}`} passHref>
                  <Button variant="outline">Edit Post</Button>
                </Link>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
