<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { letterStore, draftStore } from '$lib/stores/letterStore.js';
	import { LetterStatus } from '$lib/types.js';
	import { Save, ArrowLeft, Send } from 'lucide-svelte';

	let title = '';
	let content = '';
	let recipient = '';
	let isLoading = false;
	let isSaving = false;
	let lastSaved: Date | null = null;
	let autoSaveInterval: number;
	let draftId = '';

	// 生成草稿ID
	function generateDraftId(): string {
		return 'draft_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
	}

	// 自动保存草稿
	async function autoSaveDraft() {
		if (!title.trim() && !content.trim()) return;
		
		if (!draftId) {
			draftId = generateDraftId();
		}

		try {
			await draftStore.saveDraft({
				id: draftId,
				title: title || '无标题信笺',
				content
			});
			lastSaved = new Date();
		} catch (error) {
			console.error('自动保存失败:', error);
		}
	}

	// 手动保存草稿
	async function saveDraft() {
		if (!title.trim() && !content.trim()) {
			alert('请至少填写标题或内容');
			return;
		}

		isSaving = true;
		try {
			await autoSaveDraft();
			alert('草稿已保存');
		} catch (error) {
			alert('保存失败，请重试');
		} finally {
			isSaving = false;
		}
	}

	// 保存为正式信笺
	async function saveLetter() {
		if (!title.trim() && !content.trim()) {
			alert('请至少填写标题或内容');
			return;
		}

		if (!confirm('确定要保存这封信笺吗？保存后将无法撤销。')) {
			return;
		}

		isLoading = true;
		try {
			await letterStore.saveLetter({
				title: title || '无标题信笺',
				content,
				recipient,
				status: LetterStatus.ACTIVE,
				tags: []
			});

			// 删除草稿
			if (draftId) {
				await draftStore.deleteDraft(draftId);
			}

			alert('信笺已保存');
			goto('/letters');
		} catch (error) {
			alert('保存失败，请重试');
		} finally {
			isLoading = false;
		}
	}

	// 返回主页
	function goBack() {
		if (title.trim() || content.trim()) {
			if (confirm('有未保存的内容，确定要离开吗？')) {
				goto('/');
			}
		} else {
			goto('/');
		}
	}

	onMount(() => {
		// 设置自动保存
		autoSaveInterval = setInterval(autoSaveDraft, 30000); // 每30秒自动保存

		// 监听页面关闭事件
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (title.trim() || content.trim()) {
				e.preventDefault();
				e.returnValue = '';
			}
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	});

	onDestroy(() => {
		if (autoSaveInterval) {
			clearInterval(autoSaveInterval);
		}
		// 页面销毁时最后保存一次
		if (title.trim() || content.trim()) {
			autoSaveDraft();
		}
	});
</script>

<svelte:head>
	<title>写信 - 白鸽与乌鸦</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-dove-50 via-white to-crow-100">
	<!-- 顶部工具栏 -->
	<header class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-dove-200">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<button 
					onclick={goBack}
					class="flex items-center text-crow-600 hover:text-crow-800 transition-colors"
				>
					<ArrowLeft class="w-5 h-5 mr-2" />
					返回
				</button>

				<div class="flex items-center space-x-4">
					{#if lastSaved}
						<span class="text-sm text-crow-500">
							最后保存: {lastSaved.toLocaleTimeString()}
						</span>
					{/if}

					<button 
						onclick={saveDraft}
						disabled={isSaving}
						class="dove-button flex items-center"
					>
						<Save class="w-4 h-4 mr-2" />
						{isSaving ? '保存中...' : '保存草稿'}
					</button>

					<button 
						onclick={saveLetter}
						disabled={isLoading}
						class="crow-button flex items-center"
					>
						<Send class="w-4 h-4 mr-2" />
						{isLoading ? '保存中...' : '保存信笺'}
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- 写信区域 -->
	<main class="container mx-auto px-6 py-8">
		<div class="max-w-4xl mx-auto">
			<div class="letter-paper p-8">
				<!-- 信笺头部 -->
				<div class="mb-8">
					<input 
						bind:value={title}
						placeholder="给这封信起个标题..."
						class="w-full text-2xl font-serif text-crow-800 bg-transparent border-none outline-none placeholder-crow-400"
					/>
					<div class="mt-4 flex items-center">
						<label for="recipient-input" class="text-sm text-crow-600 mr-3">收信人:</label>
						<input
							id="recipient-input"
							bind:value={recipient}
							placeholder="可以是一个人，也可以是给自己..."
							class="flex-1 text-crow-700 bg-transparent border-none outline-none placeholder-crow-400"
						/>
					</div>
					<hr class="mt-4 border-dove-200" />
				</div>

				<!-- 信笺内容 -->
				<div class="mb-8">
					<textarea 
						bind:value={content}
						placeholder="在这里写下那些无法言说的话语...

这里是你的私密空间，没有人会看到这些文字，除非你选择分享。
你可以倾诉心事，记录感受，或者只是简单地表达此刻的心情。

不用担心文字是否优美，不用在意语法是否正确。
这里只需要真实的你。"
						class="w-full h-96 text-crow-700 bg-transparent border-none outline-none resize-none placeholder-crow-400 leading-relaxed"
						style="font-family: inherit;"
					></textarea>
				</div>

				<!-- 信笺底部 -->
				<div class="text-right text-sm text-crow-500">
					<p>写于 {new Date().toLocaleDateString('zh-CN', { 
						year: 'numeric', 
						month: 'long', 
						day: 'numeric' 
					})}</p>
				</div>
			</div>

			<!-- 提示信息 -->
			<div class="mt-6 text-center text-sm text-crow-500">
				<p>💡 系统会每30秒自动保存草稿，请放心书写</p>
				<p class="mt-1">🔒 所有内容仅存储在您的设备上，绝对私密安全</p>
			</div>
		</div>
	</main>
</div>
