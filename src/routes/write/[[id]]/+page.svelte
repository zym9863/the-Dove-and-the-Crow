<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { letterStore, draftStore } from '$lib/stores/letterStore.js';
	import { LetterStatus } from '$lib/types.js';
	import type { Letter } from '$lib/types.js';
	import { Save, ArrowLeft, Send, Trash2 } from 'lucide-svelte';

	let letterId: string | undefined;
	let isEditMode = false;
	let existingLetter: Letter | null = null;
	
	let title = '';
	let content = '';
	let recipient = '';
	let isLoading = false;
	let isSaving = false;
	let lastSaved: Date | null = null;
	let autoSaveInterval: number;
	let draftId = '';

	// 从URL参数获取信笺ID
	$: letterId = $page.params.id;
	$: isEditMode = !!letterId;

	onMount(async () => {
		await letterStore.loadLetters();
		
		if (isEditMode && letterId) {
			// 编辑模式：加载现有信笺
			await loadExistingLetter(letterId);
		} else {
			// 新建模式：生成草稿ID并启动自动保存
			draftId = generateDraftId();
			startAutoSave();
		}
	});

	onDestroy(() => {
		if (autoSaveInterval) {
			clearInterval(autoSaveInterval);
		}
	});

	// 加载现有信笺
	async function loadExistingLetter(id: string) {
		isLoading = true;
		try {
			const letter = await letterStore.getLetter(id);
			if (letter) {
				if (letter.status === LetterStatus.SEALED) {
					alert('此信笺已被封存，无法编辑');
					goto('/letters');
					return;
				}
				
				existingLetter = letter;
				title = letter.title;
				content = letter.content;
				recipient = letter.recipient || '';
				
				// 编辑模式下也启动自动保存（作为备份）
				draftId = `edit_${id}_${Date.now()}`;
				startAutoSave();
			} else {
				alert('未找到指定的信笺');
				goto('/letters');
			}
		} catch (error) {
			console.error('加载信笺失败:', error);
			alert('加载信笺失败');
			goto('/letters');
		} finally {
			isLoading = false;
		}
	}

	// 生成草稿ID
	function generateDraftId(): string {
		return 'draft_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
	}

	// 启动自动保存
	function startAutoSave() {
		// 每30秒自动保存一次
		autoSaveInterval = setInterval(autoSaveDraft, 30000);
	}

	// 自动保存草稿
	async function autoSaveDraft() {
		if (!title.trim() && !content.trim()) return;
		
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
			console.error('保存草稿失败:', error);
			alert('保存草稿失败');
		} finally {
			isSaving = false;
		}
	}

	// 保存信笺
	async function saveLetter() {
		if (!title.trim()) {
			alert('请填写信笺标题');
			return;
		}

		if (!content.trim()) {
			alert('请填写信笺内容');
			return;
		}

		isSaving = true;
		try {
			if (isEditMode && existingLetter) {
				// 更新现有信笺
				await letterStore.updateLetter(existingLetter.id, {
					title: title.trim(),
					content: content.trim(),
					recipient: recipient.trim() || undefined
				});
				alert('信笺已更新');
			} else {
				// 创建新信笺
				await letterStore.saveLetter({
					title: title.trim(),
					content: content.trim(),
					recipient: recipient.trim() || undefined,
					status: LetterStatus.ACTIVE
				});
				alert('信笺已保存');
			}
			
			// 清理草稿
			if (draftId) {
				await draftStore.deleteDraft(draftId);
			}
			
			goto('/letters');
		} catch (error) {
			console.error('保存信笺失败:', error);
			alert('保存信笺失败');
		} finally {
			isSaving = false;
		}
	}

	// 删除信笺（仅编辑模式）
	async function deleteLetter() {
		if (!isEditMode || !existingLetter) return;
		
		if (!confirm('确定要删除这封信笺吗？此操作无法恢复。')) return;
		
		try {
			await letterStore.deleteLetter(existingLetter.id);
			alert('信笺已删除');
			goto('/letters');
		} catch (error) {
			console.error('删除信笺失败:', error);
			alert('删除信笺失败');
		}
	}

	function goBack() {
		if (isEditMode) {
			goto('/letters');
		} else {
			goto('/');
		}
	}

	function formatLastSaved(date: Date): string {
		return date.toLocaleTimeString('zh-CN', {
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatDate(date: Date): string {
		return date.toLocaleDateString('zh-CN', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>{isEditMode ? '编辑信笺' : '写信笺'} - 白鸽与乌鸦</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-dove-50 via-white to-crow-50">
	<!-- 顶部导航栏 -->
	<header class="bg-white/80 backdrop-blur-sm border-b border-dove-200 sticky top-0 z-10">
		<div class="container mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<button
					on:click={goBack}
					class="dove-button-outline flex items-center"
				>
					<ArrowLeft class="w-4 h-4 mr-2" />
					返回
				</button>

				<h1 class="text-xl font-serif text-crow-800">
					{isEditMode ? '编辑信笺' : '写信笺'}
				</h1>

				<div class="flex items-center space-x-4">
					{#if lastSaved}
						<span class="text-sm text-crow-500">
							最后保存: {formatLastSaved(lastSaved)}
						</span>
					{/if}

					<button 
						on:click={saveDraft}
						disabled={isSaving}
						class="dove-button flex items-center"
					>
						<Save class="w-4 h-4 mr-2" />
						{isSaving ? '保存中...' : '保存草稿'}
					</button>

					{#if isEditMode && existingLetter}
						<button
							on:click={deleteLetter}
							class="crow-button-outline flex items-center"
						>
							<Trash2 class="w-4 h-4 mr-2" />
							删除信笺
						</button>
					{/if}

					<button 
						on:click={saveLetter}
						disabled={isSaving || !title.trim() || !content.trim()}
						class="crow-button flex items-center"
					>
						<Send class="w-4 h-4 mr-2" />
						{isEditMode ? '更新信笺' : '保存信笺'}
					</button>
				</div>
			</div>
		</div>
	</header>

	{#if isLoading}
		<div class="flex justify-center items-center py-20">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-crow-600"></div>
			<span class="ml-3 text-crow-600">加载中...</span>
		</div>
	{:else}
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
						<p>
							{#if isEditMode && existingLetter}
								创建于 {formatDate(existingLetter.createdAt)}
								{#if existingLetter.updatedAt.getTime() !== existingLetter.createdAt.getTime()}
									| 最后修改于 {formatDate(existingLetter.updatedAt)}
								{/if}
							{:else}
								写于 {new Date().toLocaleDateString('zh-CN', { 
									year: 'numeric', 
									month: 'long', 
									day: 'numeric' 
								})}
							{/if}
						</p>
					</div>
				</div>

				<!-- 提示信息 -->
				<div class="mt-6 text-center text-sm text-crow-500">
					<p>💡 系统会每30秒自动保存草稿，请放心书写</p>
					<p class="mt-1">🔒 所有内容仅存储在您的设备上，绝对私密安全</p>
				</div>
			</div>
		</main>
	{/if}
</div>
