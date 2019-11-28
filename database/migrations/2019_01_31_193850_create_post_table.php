<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('posts', function (Blueprint $table) {
      $table->increments('id');
      $table->unsignedBigInteger('usuario_id');
      $table->string('post')->nullable();
      $table->string('url_img')->nullable();
      $table->timestamp('data_post')->useCurrent();
      $table->timestamps();
      $table->foreign('usuario_id')
        ->references('id')
        ->on('usuarios')
        ->onDelete('cascade')
        ->onUpdate('cascade');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('post');
  }
}
